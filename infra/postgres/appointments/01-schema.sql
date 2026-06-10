-- =============================================================
-- BANCO: db_appointments  (Banco de consultas e agenda)
-- SERVIÇO: Appointment Service
-- RESPONSABILIDADE: Gerenciamento completo da agenda médica.
--                   Controla os horários disponíveis dos médicos,
--                   o agendamento de consultas e o processo de
--                   reserva de horário (via Saga Pattern).
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: doctor_schedules  (Grade de horários dos médicos)
-- -------------------------------------------------------------
-- Define os dias e horários em que cada médico atende.
-- Exemplo: Dr. Silva atende terças e quintas das 08h às 12h,
-- com consultas de 30 minutos.
-- A aplicação usa esta tabela para calcular os slots disponíveis
-- quando a recepcionista abre a agenda para agendar uma consulta.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctor_schedules (

    id                    UUID      PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do médico no Identity Service (sem FK real — banco isolado)
    doctor_id             UUID      NOT NULL,

    -- Dia da semana em que o médico atende
    -- 0 = Domingo, 1 = Segunda, 2 = Terça, ..., 6 = Sábado
    day_of_week           SMALLINT  NOT NULL,

    -- Horário de início e fim do período de atendimento naquele dia
    start_time            TIME      NOT NULL,
    end_time              TIME      NOT NULL,

    -- Duração de cada consulta em minutos (define os slots disponíveis)
    -- Ex: start=08:00, end=10:00, slot=30min → slots: 08:00, 08:30, 09:00, 09:30
    slot_duration_minutes SMALLINT  NOT NULL DEFAULT 30,

    -- Permite desativar a grade sem deletar o histórico
    is_active             BOOLEAN   NOT NULL DEFAULT true,

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id ON doctor_schedules (doctor_id);


-- -------------------------------------------------------------
-- TABELA: blocked_slots  (Bloqueios na agenda)
-- -------------------------------------------------------------
-- Registra períodos em que o médico NÃO atende, mesmo que
-- exista uma grade cadastrada para aquele dia/horário.
-- Usos comuns: feriados, folgas, congresso médico, férias.
-- O sistema verifica esta tabela antes de oferecer um horário
-- como disponível para agendamento.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blocked_slots (

    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Médico que terá o horário bloqueado
    doctor_id UUID        NOT NULL,

    -- Início e fim do período bloqueado (datas e horas completas)
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at   TIMESTAMPTZ NOT NULL,

    -- Motivo do bloqueio (opcional, para registro interno)
    reason    VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_doctor_id ON blocked_slots (doctor_id);
-- Índice composto para verificação rápida de conflito de horário
CREATE INDEX IF NOT EXISTS idx_blocked_slots_range ON blocked_slots (doctor_id, starts_at, ends_at);


-- -------------------------------------------------------------
-- TABELA: appointments  (Consultas agendadas)
-- -------------------------------------------------------------
-- appointments = consultas médicas agendadas
--
-- Registro de cada consulta marcada no sistema.
-- Uma consulta nasce no status 'Scheduled' e evolui conforme
-- o andamento: confirmada, cancelada, realizada ou não compareceu.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (

    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Paciente que agendou a consulta (ref ao Patient Service, sem FK real)
    patient_id       UUID        NOT NULL,

    -- Médico que realizará a consulta (ref ao Identity Service, sem FK real)
    doctor_id        UUID        NOT NULL,

    -- Data e hora exata da consulta
    scheduled_at     TIMESTAMPTZ NOT NULL,

    -- Duração prevista da consulta em minutos
    duration_minutes SMALLINT    NOT NULL DEFAULT 30,

    -- Estado atual da consulta no ciclo de vida:
    --   'Scheduled'  → agendada, aguardando confirmação
    --   'Confirmed'  → confirmada pelo médico ou recepção
    --   'Cancelled'  → cancelada (ver motivo abaixo)
    --   'Completed'  → consulta realizada
    --   'NoShow'     → paciente não compareceu
    status           VARCHAR(30) NOT NULL DEFAULT 'Scheduled',

    -- Motivo do cancelamento (preenchido apenas quando status = 'Cancelled')
    cancellation_reason VARCHAR(500),

    -- Observações gerais sobre o agendamento (uso interno da recepção)
    notes            TEXT,

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id   ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id    ON appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status       ON appointments (status);


-- =============================================================
-- TABELA: saga_state  (Controle de processo distribuído — Padrão Saga)
-- =============================================================
-- saga_state = estado da saga = controle do processo de agendamento
--
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
CREATE TABLE IF NOT EXISTS saga_state (

    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID único deste processo de agendamento.
    -- Usado para correlacionar eventos entre serviços durante o fluxo.
    correlation_id UUID         NOT NULL UNIQUE,

    -- Nome da saga (tipo de processo). Ex: 'ScheduleAppointmentSaga'
    saga_type      VARCHAR(100) NOT NULL,

    -- Etapa atual do processo. Ex: 'CheckingPatient' | 'ReservingSlot' | 'Notifying'
    current_step   VARCHAR(100) NOT NULL,

    -- Estado geral do processo:
    --   'InProgress'   → em execução, aguardando próxima etapa
    --   'Completed'    → todas as etapas concluídas com sucesso
    --   'Failed'       → falhou e não pode ser recuperado
    --   'Compensating' → desfazendo etapas anteriores após falha
    status         VARCHAR(30)  NOT NULL,

    -- Dados completos do processo em JSON (IDs, horário, dados do paciente etc.)
    -- Necessário para executar as compensações caso algo falhe
    payload        JSONB        NOT NULL,

    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saga_state_correlation_id ON saga_state (correlation_id);
CREATE INDEX IF NOT EXISTS idx_saga_state_status         ON saga_state (status);


-- =============================================================
-- TABELA: outbox_events  (Fila de saída de eventos — Padrão Outbox)
-- =============================================================
-- Eventos deste serviço: AppointmentScheduled | AppointmentCancelled
--                        AppointmentCompleted | SlotBlocked
-- Tópico Kafka destino:  prontumed.Appointment
-- Quem consome: Notification Service (dispara e-mail + push para paciente e médico)
-- =============================================================
CREATE TABLE IF NOT EXISTS outbox_events (

    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo do agregado — sempre 'Appointment' neste banco
    aggregate_type VARCHAR(100) NOT NULL,

    -- ID da consulta que originou o evento (vira chave da mensagem Kafka)
    aggregate_id   UUID         NOT NULL,

    -- Nome do evento ocorrido
    -- Ex: 'AppointmentScheduled' | 'AppointmentCancelled'
    type           VARCHAR(150) NOT NULL,

    -- Dados do evento: IDs do paciente e médico, data/hora, status etc.
    payload        JSONB        NOT NULL,

    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_appointments_created_at ON outbox_events (created_at);
