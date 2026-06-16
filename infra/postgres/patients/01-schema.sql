-- =============================================================
-- BANCO: db_patients
-- SERVIÇO: Patient Service
-- RESPONSABILIDADE: Cadastro e gestão dos dados dos pacientes.
--                   Armazena informações pessoais, de contato e
--                   endereço. Separado do Identity porque paciente
--                   tem dados clínicos/pessoais que vão além do login.
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: pacientes  (Pacientes da clínica)
-- -------------------------------------------------------------
-- Contém o cadastro completo do paciente como pessoa.
-- Não armazena dados clínicos (prontuário fica no Medical Record Service).
--
-- IMPORTANTE: o campo id_usuario referencia o usuário no Identity Service,
-- mas NÃO é uma chave estrangeira real (sem REFERENCES), porque cada
-- serviço tem seu próprio banco isolado — comunicação entre serviços
-- ocorre apenas por eventos Kafka, nunca por JOIN entre bancos.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pacientes (

    -- Identificador único do paciente no sistema
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do usuário correspondente no Identity Service.
    -- Permite ao BFF vincular o login do paciente ao seu cadastro clínico.
    -- Não é FK real pois os bancos são isolados (Database per Service).
    id_usuario          UUID         NOT NULL UNIQUE,

    -- Nome completo do paciente (como consta no documento)
    nome_completo       VARCHAR(200) NOT NULL,

    -- CPF no formato '000.000.000-00' — único por paciente
    cpf                 VARCHAR(14)  NOT NULL UNIQUE,

    -- Data de nascimento — usada para calcular idade e para identificação
    data_nascimento     DATE         NOT NULL,

    -- Sexo biológico do paciente (relevante para diagnósticos)
    -- Valores: 'Male' | 'Female' | 'Other'
    sexo                VARCHAR(20),

    -- Telefone principal para contato e envio de notificações
    telefone            VARCHAR(20),

    -- E-mail do paciente (pode ser diferente do e-mail de login)
    email               VARCHAR(255),

    -- Endereço residencial — armazenado inline para simplificar o MVP.
    -- Em versões futuras pode ser extraído para uma tabela de endereços.
    endereco_logradouro VARCHAR(255),  -- Logradouro e número
    endereco_cidade     VARCHAR(100),  -- Cidade
    endereco_uf         VARCHAR(2),    -- UF (ex: 'SP', 'RJ')
    endereco_cep        VARCHAR(10),   -- CEP

    -- Pacientes inativados não aparecem nas buscas mas são mantidos
    -- no banco para preservar histórico (exigência LGPD: não deletar dados)
    ativo               BOOLEAN      NOT NULL DEFAULT true,

    criado_em           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices para as buscas mais comuns na recepção
CREATE INDEX IF NOT EXISTS idx_pacientes_id_usuario ON pacientes (id_usuario);  -- login → cadastro
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf        ON pacientes (cpf);         -- busca por CPF na recepção


-- =============================================================
-- TABELA: eventos_saida  (Fila de saída de eventos — Padrão Outbox)
-- =============================================================
-- Mesma função que no Identity Service: garante entrega confiável
-- de eventos para o Kafka sem risco de inconsistência entre
-- salvar o paciente e publicar o evento.
--
-- Eventos deste serviço: PatientCreated | PatientUpdated | PatientDeactivated
-- Tópico Kafka destino:  prontumed.Patient
-- Quem consome: Notification Service (boas-vindas, lembretes etc.)
-- =============================================================
CREATE TABLE IF NOT EXISTS eventos_saida (

    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo do agregado — sempre 'Patient' neste banco
    -- Debezium usa este campo para rotear ao tópico 'prontumed.Patient'
    tipo_agregado  VARCHAR(100) NOT NULL,

    -- ID do paciente que originou o evento (vira chave da mensagem Kafka)
    id_agregado    UUID         NOT NULL,

    -- Nome do evento: 'PatientCreated' | 'PatientUpdated' | 'PatientDeactivated'
    tipo_evento    VARCHAR(150) NOT NULL,

    -- Dados do evento em JSON — contém os campos relevantes do paciente
    payload        JSONB        NOT NULL,

    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_saida_patients_criado_em ON eventos_saida (criado_em);
