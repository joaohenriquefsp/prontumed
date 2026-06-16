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
-- IMPORTANTE: id_usuario é uma referência lógica ao usuário no Identity Service,
-- mas NÃO é FK real (sem REFERENCES), pois cada serviço tem banco isolado.
-- Comunicação entre serviços ocorre apenas via eventos Kafka, nunca por JOIN.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pacientes (

    -- Identificador único do paciente no sistema
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do usuário correspondente no Identity Service (opcional no MVP).
    -- Permite vincular o login do paciente ao seu cadastro clínico.
    -- Nullable: paciente pode ser cadastrado antes de ter conta de acesso.
    id_usuario          UUID         UNIQUE,

    -- Nome completo do paciente (separado em dois campos para ordenação e busca)
    primeiro_nome       VARCHAR(100) NOT NULL,
    sobrenome           VARCHAR(100) NOT NULL,

    -- CPF armazenado apenas com dígitos (11 caracteres), sem pontuação.
    -- A formatação '000.000.000-00' é responsabilidade do BFF ao exibir.
    -- Dígito verificador validado na camada de domínio do serviço.
    cpf                 VARCHAR(11)  NOT NULL UNIQUE,

    -- Data de nascimento — usada para calcular idade e para identificação
    data_nascimento     DATE         NOT NULL,

    -- Sexo biológico do paciente (relevante para diagnósticos)
    -- Valores: 'Masculino' | 'Feminino' | 'Outro'
    sexo                VARCHAR(20),

    -- Telefone principal para contato e envio de notificações
    telefone            VARCHAR(20),

    -- E-mail do paciente (pode ser diferente do e-mail de login)
    email               VARCHAR(255),

    -- Endereço residencial — campos separados para facilitar busca e filtragem
    endereco_logradouro VARCHAR(255),
    endereco_cidade     VARCHAR(100),
    endereco_uf         VARCHAR(2),
    endereco_cep        VARCHAR(8),   -- apenas dígitos (ex: '30140110')

    -- Pacientes inativados não aparecem nas buscas mas são mantidos
    -- no banco para preservar histórico (exigência LGPD: não deletar dados)
    ativo               BOOLEAN      NOT NULL DEFAULT true,

    criado_em           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pacientes_id_usuario   ON pacientes (id_usuario);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf          ON pacientes (cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_primeiro_nome ON pacientes (primeiro_nome);
CREATE INDEX IF NOT EXISTS idx_pacientes_sobrenome     ON pacientes (sobrenome);


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
    tipo_agregado  VARCHAR(100) NOT NULL,

    -- ID do paciente que originou o evento (vira chave da mensagem Kafka)
    id_agregado    UUID         NOT NULL,

    -- Nome do evento: 'PatientCreated' | 'PatientUpdated' | 'PatientDeactivated'
    tipo_evento    VARCHAR(150) NOT NULL,

    payload        JSONB        NOT NULL,

    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_saida_patients_criado_em ON eventos_saida (criado_em);
