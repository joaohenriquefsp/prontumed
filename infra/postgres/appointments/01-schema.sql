-- =============================================================
-- BANCO: db_appointments  (Banco de consultas e agenda)
-- SERVIÇO: Appointment Service
-- RESPONSABILIDADE: Gerenciamento completo da agenda médica.
--                   Controla os horários disponíveis dos médicos,
--                   o agendamento de consultas e o processo de
--                   reserva de horário (via Saga Pattern).
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: grade_horarios  (Grade de horários dos médicos)
-- -------------------------------------------------------------
-- Define os dias e horários em que cada médico atende.
-- Exemplo: Dr. Silva atende terças e quintas das 08h às 12h,
-- com consultas de 30 minutos.
-- A aplicação usa esta tabela para calcular os slots disponíveis
-- quando a recepcionista abre a agenda para agendar uma consulta.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grade_horarios (

    id                   UUID      PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do médico no Identity Service (sem FK real — banco isolado)
    id_medico            UUID      NOT NULL,

    -- Dia da semana em que o médico atende
    -- 0 = Domingo, 1 = Segunda, 2 = Terça, ..., 6 = Sábado
    dia_semana           SMALLINT  NOT NULL,

    -- Horário de início e fim do período de atendimento naquele dia
    horario_inicio       TIME      NOT NULL,
    horario_fim          TIME      NOT NULL,

    -- Duração de cada consulta em minutos (define os slots disponíveis)
    -- Ex: horario_inicio=08:00, horario_fim=10:00, duracao=30min → slots: 08:00, 08:30, 09:00, 09:30
    duracao_slot_minutos SMALLINT  NOT NULL DEFAULT 30,

    -- Permite desativar a grade sem deletar o histórico
    ativo                BOOLEAN   NOT NULL DEFAULT true,

    criado_em            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grade_horarios_id_medico ON grade_horarios (id_medico);


-- -------------------------------------------------------------
-- TABELA: horarios_bloqueados  (Bloqueios na agenda)
-- -------------------------------------------------------------
-- Registra períodos em que o médico NÃO atende, mesmo que
-- exista uma grade cadastrada para aquele dia/horário.
-- Usos comuns: feriados, folgas, congresso médico, férias.
-- O sistema verifica esta tabela antes de oferecer um horário
-- como disponível para agendamento.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS horarios_bloqueados (

    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Médico que terá o horário bloqueado
    id_medico UUID        NOT NULL,

    -- Início e fim do período bloqueado (datas e horas completas)
    inicio_em TIMESTAMPTZ NOT NULL,
    fim_em    TIMESTAMPTZ NOT NULL,

    -- Motivo do bloqueio (opcional, para registro interno)
    motivo    VARCHAR(255),

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horarios_bloqueados_id_medico ON horarios_bloqueados (id_medico);
-- Índice composto para verificação rápida de conflito de horário
CREATE INDEX IF NOT EXISTS idx_horarios_bloqueados_intervalo ON horarios_bloqueados (id_medico, inicio_em, fim_em);


-- -------------------------------------------------------------
-- TABELA: consultas  (Consultas agendadas)
-- -------------------------------------------------------------
-- Registro de cada consulta marcada no sistema.
-- Uma consulta nasce no status 'Agendado' e evolui conforme
-- o andamento: confirmada, cancelada, realizada ou não compareceu.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consultas (

    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Paciente que agendou a consulta (ref ao Patient Service, sem FK real)
    id_paciente         UUID        NOT NULL,

    -- Médico que realizará a consulta (ref ao Identity Service, sem FK real)
    id_medico           UUID        NOT NULL,

    -- Data e hora exata da consulta
    agendado_para       TIMESTAMPTZ NOT NULL,

    -- Duração prevista da consulta em minutos
    duracao_minutos     SMALLINT    NOT NULL DEFAULT 30,

    -- Estado atual da consulta no ciclo de vida:
    --   'Agendado'   → agendada, aguardando confirmação
    --   'Confirmado' → confirmada pelo médico ou recepção
    --   'Cancelado'  → cancelada (ver motivo abaixo)
    --   'Concluido'  → consulta realizada
    --   'NoShow'     → paciente não compareceu
    status              VARCHAR(30) NOT NULL DEFAULT 'Agendado',

    -- Motivo do cancelamento (preenchido apenas quando status = 'Cancelado')
    motivo_cancelamento VARCHAR(500),

    -- Observações gerais sobre o agendamento (uso interno da recepção)
    observacoes         TEXT,

    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultas_id_paciente   ON consultas (id_paciente);
CREATE INDEX IF NOT EXISTS idx_consultas_id_medico     ON consultas (id_medico);
CREATE INDEX IF NOT EXISTS idx_consultas_agendado_para ON consultas (agendado_para);
CREATE INDEX IF NOT EXISTS idx_consultas_status        ON consultas (status);

-- Constraint única parcial anti-double-booking (ADR/PR #10): impede que o mesmo
-- médico tenha duas consultas no mesmo horário, exceto quando uma delas já foi
-- cancelada, concluída ou marcada como NoShow (libera o slot para reagendamento).
CREATE UNIQUE INDEX IF NOT EXISTS idx_consultas_slot_unico
    ON consultas (id_medico, agendado_para)
    WHERE status NOT IN ('Cancelado', 'Concluido', 'NoShow');


-- =============================================================
-- TABELA: estado_saga  (Controle de processo distribuído — Padrão Saga)
-- =============================================================
-- PROBLEMA QUE RESOLVE:
--   Agendar uma consulta envolve múltiplas etapas em serviços diferentes:
--     1. Verificar se o paciente existe (Patient Service)
--     2. Verificar se o horário está disponível (Appointment Service)
--     3. Reservar o horário (Appointment Service)
--     4. Notificar paciente e médico (Notification Service)
--
--   Se qualquer etapa falhar no meio do processo, o sistema precisa
--   desfazer as etapas anteriores (compensação automática). Sem controle,
--   o horário ficaria reservado mas sem consulta confirmada.
--
-- SOLUÇÃO (Padrão Saga):
--   Esta tabela registra em qual etapa o processo está e seu estado.
--   Se algo der errado, o sistema consulta esta tabela para saber
--   quais ações de compensação executar (ex: liberar o horário).
-- =============================================================
CREATE TABLE IF NOT EXISTS estado_saga (

    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID único deste processo de agendamento.
    -- Usado para correlacionar eventos entre serviços durante o fluxo.
    id_correlacao UUID         NOT NULL UNIQUE,

    -- Nome da saga (tipo de processo). Ex: 'ScheduleAppointmentSaga'
    tipo_saga     VARCHAR(100) NOT NULL,

    -- Etapa atual do processo. Ex: 'CheckingPatient' | 'ReservingSlot' | 'Notifying'
    etapa_atual   VARCHAR(100) NOT NULL,

    -- Estado geral do processo:
    --   'InProgress'   → em execução, aguardando próxima etapa
    --   'Completed'    → todas as etapas concluídas com sucesso
    --   'Failed'       → falhou e não pode ser recuperado
    --   'Compensating' → desfazendo etapas anteriores após falha
    status        VARCHAR(30)  NOT NULL,

    -- Dados completos do processo em JSON (IDs, horário, dados do paciente etc.)
    -- Necessário para executar as compensações caso algo falhe
    payload       JSONB        NOT NULL,

    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estado_saga_id_correlacao ON estado_saga (id_correlacao);
CREATE INDEX IF NOT EXISTS idx_estado_saga_status        ON estado_saga (status);


-- =============================================================
-- TABELA: eventos_saida  (Fila de saída de eventos — Padrão Outbox)
-- =============================================================
-- Eventos deste serviço: AppointmentScheduled | AppointmentCancelled
--                        AppointmentCompleted | SlotBlocked
-- Tópico Kafka destino:  prontumed.Appointment
-- Quem consome: Notification Service (dispara e-mail + push para paciente e médico)
-- =============================================================
CREATE TABLE IF NOT EXISTS eventos_saida (

    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo do agregado — sempre 'Appointment' neste banco
    tipo_agregado  VARCHAR(100) NOT NULL,

    -- ID da consulta que originou o evento (vira chave da mensagem Kafka)
    id_agregado    UUID         NOT NULL,

    -- Nome do evento ocorrido
    -- Ex: 'AppointmentScheduled' | 'AppointmentCancelled'
    tipo_evento    VARCHAR(150) NOT NULL,

    -- Dados do evento: IDs do paciente e médico, data/hora, status etc.
    payload        JSONB        NOT NULL,

    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_saida_appointments_criado_em ON eventos_saida (criado_em);
