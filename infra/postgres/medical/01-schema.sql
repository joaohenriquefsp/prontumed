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
-- TABELA: event_store  (Armazém de eventos do prontuário — Event Sourcing)
-- =============================================================
-- event_store = repositório de eventos do prontuário
--
-- Esta é a tabela mais importante deste serviço.
-- Cada linha representa algo que ACONTECEU com um prontuário,
-- na ordem exata em que ocorreu. NUNCA se faz UPDATE aqui.
--
-- Exemplo de sequência de eventos de um paciente:
--   version 1: RecordCreated         → prontuário criado na primeira consulta
--   version 2: ConsultationNoteAdded → médico adicionou anotação da consulta
--   version 3: DiagnosisAdded        → diagnóstico registrado
--   version 4: PrescriptionAdded     → receita médica emitida
--
-- Para saber o estado atual do prontuário, a aplicação lê todos os
-- eventos daquele paciente em ordem e "reconstrói" o estado atual.
-- =============================================================
CREATE TABLE IF NOT EXISTS event_store (

    -- Identificador único deste evento específico
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do prontuário ao qual este evento pertence.
    -- Cada paciente tem um prontuário com seu próprio aggregate_id.
    -- Todos os eventos do mesmo paciente compartilham este ID.
    aggregate_id   UUID         NOT NULL,

    -- Tipo do agregado — sempre 'MedicalRecord' neste banco
    aggregate_type VARCHAR(100) NOT NULL DEFAULT 'MedicalRecord',

    -- Tipo do evento que ocorreu. Exemplos:
    --   'RecordCreated'         → prontuário criado (primeira consulta)
    --   'ConsultationNoteAdded' → médico adicionou anotação de consulta
    --   'DiagnosisAdded'        → diagnóstico registrado
    --   'PrescriptionAdded'     → receita médica emitida
    event_type     VARCHAR(150) NOT NULL,

    -- Número sequencial do evento dentro do prontuário deste paciente.
    -- Começa em 1 e incrementa a cada novo evento.
    -- Garante que os eventos sejam lidos na ordem correta.
    -- A constraint UNIQUE abaixo impede dois eventos com mesmo version no mesmo prontuário.
    version        INT          NOT NULL,

    -- Dados completos do evento em JSON.
    -- Ex para ConsultationNoteAdded:
    --   { "doctorId": "...", "noteText": "Paciente relata dor...", "consultationDate": "..." }
    payload        JSONB        NOT NULL,

    -- Informações de contexto do evento (quem gerou, de onde, correlationId).
    -- Usado para rastreabilidade técnica e auditoria de segurança.
    -- Ex: { "userId": "...", "ip": "192.168.1.1", "correlationId": "..." }
    metadata       JSONB,

    -- Data e hora EXATA em que o evento ocorreu (imutável após inserção)
    occurred_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Garante que não existam dois eventos com o mesmo número de versão
    -- no mesmo prontuário — protege contra duplicatas e race conditions
    UNIQUE (aggregate_id, version)
);

-- Índices para reconstrução rápida do prontuário
CREATE INDEX IF NOT EXISTS idx_event_store_aggregate_id      ON event_store (aggregate_id);
CREATE INDEX IF NOT EXISTS idx_event_store_aggregate_version ON event_store (aggregate_id, version);
CREATE INDEX IF NOT EXISTS idx_event_store_event_type        ON event_store (event_type);
CREATE INDEX IF NOT EXISTS idx_event_store_occurred_at       ON event_store (occurred_at);


-- =============================================================
-- TABELA: record_access_log  (Histórico de quem acessou cada prontuário)
-- =============================================================
-- record_access_log = log de acesso ao prontuário
--
-- OBRIGAÇÃO LEGAL:
--   A LGPD (Lei nº 13.709/2018) e as resoluções do CFM exigem que
--   qualquer acesso a dados sensíveis de saúde seja registrado.
--   Este log responde: "quem viu o prontuário do paciente X e quando?"
--
-- Toda vez que um médico abre um prontuário, a aplicação insere
-- uma linha aqui automaticamente, mesmo que seja só para leitura.
-- =============================================================
CREATE TABLE IF NOT EXISTS record_access_log (

    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do prontuário que foi acessado (aggregate_id da event_store)
    record_aggregate_id UUID        NOT NULL,

    -- ID do usuário (médico ou profissional) que realizou o acesso
    -- (ref ao Identity Service, sem FK real)
    accessed_by_user_id UUID        NOT NULL,

    -- Data e hora exata do acesso
    accessed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- O que o usuário fez com o prontuário:
    --   'Viewed'   → apenas visualizou
    --   'Exported' → exportou/baixou o arquivo
    --   'Printed'  → imprimiu
    action              VARCHAR(50) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_access_log_aggregate_id ON record_access_log (record_aggregate_id);
CREATE INDEX IF NOT EXISTS idx_access_log_user_id      ON record_access_log (accessed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_access_log_accessed_at  ON record_access_log (accessed_at);


-- =============================================================
-- TABELA: outbox_events  (Fila de saída de eventos — Padrão Outbox)
-- =============================================================
-- Eventos deste serviço: RecordCreated | ConsultationNoteAdded | RecordAccessed
-- Tópico Kafka destino:  prontumed.MedicalRecord
-- Quem consome: outros serviços que precisam reagir a eventos clínicos
-- =============================================================
CREATE TABLE IF NOT EXISTS outbox_events (

    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo do agregado — sempre 'MedicalRecord' neste banco
    aggregate_type VARCHAR(100) NOT NULL,

    -- ID do prontuário que originou o evento
    aggregate_id   UUID         NOT NULL,

    -- Nome do evento ocorrido
    type           VARCHAR(150) NOT NULL,

    -- Dados do evento em JSON
    payload        JSONB        NOT NULL,

    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_medical_created_at ON outbox_events (created_at);
