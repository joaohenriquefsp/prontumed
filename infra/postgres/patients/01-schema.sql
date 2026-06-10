-- =============================================================
-- BANCO: db_patients
-- SERVIÇO: Patient Service
-- RESPONSABILIDADE: Cadastro e gestão dos dados dos pacientes.
--                   Armazena informações pessoais, de contato e
--                   endereço. Separado do Identity porque paciente
--                   tem dados clínicos/pessoais que vão além do login.
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: patients  (Pacientes da clínica)
-- -------------------------------------------------------------
-- Contém o cadastro completo do paciente como pessoa.
-- Não armazena dados clínicos (prontuário fica no Medical Record Service).
--
-- IMPORTANTE: o campo user_id referencia o usuário no Identity Service,
-- mas NÃO é uma chave estrangeira real (sem REFERENCES), porque cada
-- serviço tem seu próprio banco isolado — comunicação entre serviços
-- ocorre apenas por eventos Kafka, nunca por JOIN entre bancos.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (

    -- Identificador único do paciente no sistema
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do usuário correspondente no Identity Service.
    -- Permite ao BFF vincular o login do paciente ao seu cadastro clínico.
    -- Não é FK real pois os bancos são isolados (Database per Service).
    user_id       UUID         NOT NULL UNIQUE,

    -- Nome completo do paciente (como consta no documento)
    full_name     VARCHAR(200) NOT NULL,

    -- CPF no formato '000.000.000-00' — único por paciente
    cpf           VARCHAR(14)  NOT NULL UNIQUE,

    -- Data de nascimento — usada para calcular idade e para identificação
    date_of_birth DATE         NOT NULL,

    -- Sexo biológico do paciente (relevante para diagnósticos)
    -- Valores: 'Male' | 'Female' | 'Other'
    gender        VARCHAR(20),

    -- Telefone principal para contato e envio de notificações
    phone         VARCHAR(20),

    -- E-mail do paciente (pode ser diferente do e-mail de login)
    email         VARCHAR(255),

    -- Endereço residencial — armazenado inline para simplificar o MVP.
    -- Em versões futuras pode ser extraído para uma tabela de endereços.
    address_street VARCHAR(255),  -- Logradouro e número
    address_city   VARCHAR(100),  -- Cidade
    address_state  VARCHAR(2),    -- UF (ex: 'SP', 'RJ')
    address_zip    VARCHAR(10),   -- CEP

    -- Pacientes inativados não aparecem nas buscas mas são mantidos
    -- no banco para preservar histórico (exigência LGPD: não deletar dados)
    is_active     BOOLEAN      NOT NULL DEFAULT true,

    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices para as buscas mais comuns na recepção
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients (user_id);  -- login → cadastro
CREATE INDEX IF NOT EXISTS idx_patients_cpf     ON patients (cpf);      -- busca por CPF na recepção


-- =============================================================
-- TABELA: outbox_events  (Fila de saída de eventos — Padrão Outbox)
-- =============================================================
-- Mesma função que no Identity Service: garante entrega confiável
-- de eventos para o Kafka sem risco de inconsistência entre
-- salvar o paciente e publicar o evento.
--
-- Eventos deste serviço: PatientCreated | PatientUpdated | PatientDeactivated
-- Tópico Kafka destino:  prontumed.Patient
-- Quem consome: Notification Service (boas-vindas, lembretes etc.)
-- =============================================================
CREATE TABLE IF NOT EXISTS outbox_events (

    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo do agregado — sempre 'Patient' neste banco
    -- Debezium usa este campo para rotear ao tópico 'prontumed.Patient'
    aggregate_type VARCHAR(100) NOT NULL,

    -- ID do paciente que originou o evento (vira chave da mensagem Kafka)
    aggregate_id   UUID         NOT NULL,

    -- Nome do evento: 'PatientCreated' | 'PatientUpdated' | 'PatientDeactivated'
    type           VARCHAR(150) NOT NULL,

    -- Dados do evento em JSON — contém os campos relevantes do paciente
    payload        JSONB        NOT NULL,

    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_patients_created_at ON outbox_events (created_at);
