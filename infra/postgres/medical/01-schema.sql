-- =============================================================
-- BANCO: db_medical_records  (Banco de prontuários eletrônicos)
-- SERVIÇO: Medical Record Service
-- RESPONSABILIDADE: Prontuário eletrônico do paciente.
--                   Este serviço usa uma abordagem diferente dos demais:
--                   em vez de salvar o "estado atual" do prontuário,
--                   ele salva TODOS OS EVENTOS que aconteceram com ele
--                   (Event Sourcing). O prontuário atual é reconstruído
--                   lendo todos os eventos na ordem em que ocorreram.
--
-- POR QUÊ EVENT SOURCING AQUI?
--   O Conselho Federal de Medicina (CFM) e a LGPD exigem que o
--   histórico clínico seja imutável e auditável. Com Event Sourcing,
--   é impossível "editar" ou "apagar" uma anotação médica — o máximo
--   que se pode fazer é adicionar uma nova entrada corrigindo a anterior,
--   preservando todo o histórico.
-- =============================================================


-- =============================================================
-- TABELA: repositorio_eventos  (Armazém de eventos do prontuário — Event Sourcing)
-- =============================================================
-- Esta é a tabela mais importante deste serviço.
-- Cada linha representa algo que ACONTECEU com um prontuário,
-- na ordem exata em que ocorreu. NUNCA se faz UPDATE aqui.
--
-- Exemplo de sequência de eventos de um paciente:
--   versao 1: RecordCreated         → prontuário criado na primeira consulta
--   versao 2: ConsultationNoteAdded → médico adicionou anotação da consulta
--   versao 3: DiagnosisAdded        → diagnóstico registrado
--   versao 4: PrescriptionAdded     → receita médica emitida
--
-- Para saber o estado atual do prontuário, a aplicação lê todos os
-- eventos daquele paciente em ordem e "reconstrói" o estado atual.
-- =============================================================
CREATE TABLE IF NOT EXISTS repositorio_eventos (

    -- Identificador único deste evento específico
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do prontuário ao qual este evento pertence.
    -- Cada paciente tem um prontuário com seu próprio id_agregado.
    -- Todos os eventos do mesmo paciente compartilham este ID.
    id_agregado    UUID         NOT NULL,

    -- Tipo do agregado — sempre 'MedicalRecord' neste banco
    tipo_agregado  VARCHAR(100) NOT NULL DEFAULT 'MedicalRecord',

    -- Tipo do evento que ocorreu. Exemplos:
    --   'RecordCreated'         → prontuário criado (primeira consulta)
    --   'ConsultationNoteAdded' → médico adicionou anotação de consulta
    --   'DiagnosisAdded'        → diagnóstico registrado
    --   'PrescriptionAdded'     → receita médica emitida
    tipo_evento    VARCHAR(150) NOT NULL,

    -- Número sequencial do evento dentro do prontuário deste paciente.
    -- Começa em 1 e incrementa a cada novo evento.
    -- Garante que os eventos sejam lidos na ordem correta.
    -- A constraint UNIQUE abaixo impede dois eventos com mesmo versao no mesmo prontuário.
    versao         INT          NOT NULL,

    -- Dados completos do evento em JSON.
    -- Ex para ConsultationNoteAdded:
    --   { "doctorId": "...", "noteText": "Paciente relata dor...", "consultationDate": "..." }
    payload        JSONB        NOT NULL,

    -- Informações de contexto do evento (quem gerou, de onde, correlationId).
    -- Usado para rastreabilidade técnica e auditoria de segurança.
    -- Ex: { "userId": "...", "ip": "192.168.1.1", "correlationId": "..." }
    metadados      JSONB,

    -- Data e hora EXATA em que o evento ocorreu (imutável após inserção)
    ocorreu_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Garante que não existam dois eventos com o mesmo número de versão
    -- no mesmo prontuário — protege contra duplicatas e race conditions
    UNIQUE (id_agregado, versao)
);

-- Índices para reconstrução rápida do prontuário
CREATE INDEX IF NOT EXISTS idx_repositorio_eventos_id_agregado ON repositorio_eventos (id_agregado);
CREATE INDEX IF NOT EXISTS idx_repositorio_eventos_versao      ON repositorio_eventos (id_agregado, versao);
CREATE INDEX IF NOT EXISTS idx_repositorio_eventos_tipo_evento ON repositorio_eventos (tipo_evento);
CREATE INDEX IF NOT EXISTS idx_repositorio_eventos_ocorreu_em  ON repositorio_eventos (ocorreu_em);


-- =============================================================
-- TABELA: log_acesso_prontuario  (Histórico de quem acessou cada prontuário)
-- =============================================================
-- OBRIGAÇÃO LEGAL:
--   A LGPD (Lei nº 13.709/2018) e as resoluções do CFM exigem que
--   qualquer acesso a dados sensíveis de saúde seja registrado.
--   Este log responde: "quem viu o prontuário do paciente X e quando?"
--
-- Toda vez que um médico abre um prontuário, a aplicação insere
-- uma linha aqui automaticamente, mesmo que seja só para leitura.
-- =============================================================
CREATE TABLE IF NOT EXISTS log_acesso_prontuario (

    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do prontuário que foi acessado (id_agregado da repositorio_eventos)
    id_prontuario     UUID        NOT NULL,

    -- ID do usuário (médico ou profissional) que realizou o acesso
    -- (ref ao Identity Service, sem FK real)
    id_usuario_acesso UUID        NOT NULL,

    -- Data e hora exata do acesso
    acessado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- O que o usuário fez com o prontuário:
    --   'Viewed'   → apenas visualizou
    --   'Exported' → exportou/baixou o arquivo
    --   'Printed'  → imprimiu
    acao              VARCHAR(50) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_log_acesso_id_prontuario ON log_acesso_prontuario (id_prontuario);
CREATE INDEX IF NOT EXISTS idx_log_acesso_id_usuario    ON log_acesso_prontuario (id_usuario_acesso);
CREATE INDEX IF NOT EXISTS idx_log_acesso_acessado_em   ON log_acesso_prontuario (acessado_em);


-- =============================================================
-- TABELA: eventos_saida  (Fila de saída de eventos — Padrão Outbox)
-- =============================================================
-- Eventos deste serviço: RecordCreated | ConsultationNoteAdded | RecordAccessed
-- Tópico Kafka destino:  prontumed.MedicalRecord
-- Quem consome: outros serviços que precisam reagir a eventos clínicos
-- =============================================================
CREATE TABLE IF NOT EXISTS eventos_saida (

    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo do agregado — sempre 'MedicalRecord' neste banco
    tipo_agregado  VARCHAR(100) NOT NULL,

    -- ID do prontuário que originou o evento
    id_agregado    UUID         NOT NULL,

    -- Nome do evento ocorrido
    tipo_evento    VARCHAR(150) NOT NULL,

    -- Dados do evento em JSON
    payload        JSONB        NOT NULL,

    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_saida_medical_criado_em ON eventos_saida (criado_em);
