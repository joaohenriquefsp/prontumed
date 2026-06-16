-- =============================================================
-- BANCO: db_identity
-- SERVIÇO: Identity Service
-- RESPONSABILIDADE: Autenticação, gestão de usuários e controle
--                   de acesso ao sistema (quem pode entrar e com
--                   qual perfil).
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: usuarios  (Usuários do sistema)
-- -------------------------------------------------------------
-- Armazena todos os usuários cadastrados, independente do perfil.
-- Um usuário pode ser: Paciente, Médico, Recepcionista ou Admin.
-- O campo "perfil" é usado pelo BFF para decidir quais
-- rotas e dados cada usuário pode acessar (controle RBAC).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (

    -- Identificador único do usuário (gerado automaticamente pelo banco)
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- E-mail de login — deve ser único no sistema
    email         VARCHAR(255) NOT NULL UNIQUE,

    -- Senha armazenada como hash (nunca em texto puro)
    -- Algoritmo utilizado: BCrypt (definido na camada de aplicação)
    hash_senha    VARCHAR(255) NOT NULL,

    -- Nome e sobrenome do usuário
    primeiro_nome VARCHAR(100) NOT NULL,
    sobrenome     VARCHAR(100) NOT NULL,

    -- Perfil de acesso do usuário no sistema.
    -- Valores possíveis: 'Patient' | 'Doctor' | 'Receptionist' | 'Admin'
    -- Este campo é incluído no token JWT e validado pelo BFF em cada requisição.
    perfil        VARCHAR(50)  NOT NULL,

    -- Indica se o usuário está ativo. Usuários inativos não conseguem fazer login.
    -- Usamos exclusão lógica (soft delete) para manter histórico — exigência da LGPD.
    ativo         BOOLEAN      NOT NULL DEFAULT true,

    -- Data e hora de criação do registro (preenchida automaticamente)
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Data e hora da última atualização (deve ser atualizada pela aplicação)
    atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- -------------------------------------------------------------
-- TABELA: tokens_renovacao  (Tokens de renovação de sessão)
-- -------------------------------------------------------------
-- Quando um usuário faz login, ele recebe dois tokens:
--   1. Access token (JWT) — válido por 15 minutos, fica na memória
--   2. Refresh token — válido por 7 dias, fica salvo nesta tabela
--
-- Quando o access token expira, o sistema usa o refresh token
-- para gerar um novo par de tokens sem pedir nova senha.
-- Ao fazer logout, o refresh token é revogado (revogado_em preenchido).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tokens_renovacao (

    -- Identificador único do token
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuário dono deste token
    -- ON DELETE CASCADE: se o usuário for removido, seus tokens também são
    id_usuario  UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

    -- O token em si é armazenado como hash por segurança.
    -- O valor original é enviado ao cliente, mas aqui guardamos apenas o hash.
    hash_token  VARCHAR(255) NOT NULL UNIQUE,

    -- Data/hora em que este token deixa de ser válido (hoje + 7 dias)
    expira_em   TIMESTAMPTZ  NOT NULL,

    -- Preenchido quando o usuário faz logout ou o token é invalidado manualmente.
    -- Token com revogado_em preenchido é recusado mesmo que ainda não tenha expirado.
    revogado_em TIMESTAMPTZ,

    -- Data/hora em que o token foi criado
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_renovacao_id_usuario ON tokens_renovacao (id_usuario);
CREATE INDEX IF NOT EXISTS idx_tokens_renovacao_hash_token ON tokens_renovacao (hash_token);
CREATE INDEX IF NOT EXISTS idx_tokens_renovacao_expira_em  ON tokens_renovacao (expira_em);


-- =============================================================
-- TABELA: eventos_saida  (Fila de saída de eventos — Padrão Outbox)
-- =============================================================
-- PROBLEMA QUE RESOLVE:
--   Quando a aplicação salva um dado no banco E precisa notificar
--   outros serviços via Kafka, existe risco de falha entre as duas
--   operações: o dado é salvo mas o evento não é enviado (ou vice-versa).
--
-- SOLUÇÃO (Padrão Outbox):
--   Em vez de publicar no Kafka diretamente, a aplicação salva o evento
--   nesta tabela NA MESMA TRANSAÇÃO SQL em que salva o dado principal.
--   O Debezium monitora esta tabela pelo WAL do PostgreSQL e publica
--   no Kafka de forma confiável, mesmo que o Kafka esteja fora do ar.
--
-- FLUXO:
--   1. Aplicação: salva usuário + insere linha aqui (1 transação atômica)
--   2. Debezium: detecta o INSERT no WAL e publica no tópico Kafka
--   3. Outros serviços consomem o evento do Kafka
--
-- Eventos deste serviço: UserCreated | UserRoleChanged | PasswordReset
-- Tópico Kafka destino:  prontumed.User
-- =============================================================
CREATE TABLE IF NOT EXISTS eventos_saida (

    -- Identificador único do evento
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo do agregado que gerou o evento.
    -- Usado pelo Debezium para decidir em qual tópico Kafka publicar.
    -- Exemplo: 'User' → publica no tópico 'prontumed.User'
    tipo_agregado  VARCHAR(100) NOT NULL,

    -- ID da entidade que gerou o evento.
    -- Vira a chave (key) da mensagem no Kafka, garantindo que eventos
    -- do mesmo agregado fiquem na mesma partição e em ordem.
    id_agregado    UUID         NOT NULL,

    -- Nome do evento ocorrido.
    -- Exemplos: 'UserCreated' | 'UserRoleChanged' | 'PasswordReset'
    tipo_evento    VARCHAR(150) NOT NULL,

    -- Dados completos do evento em formato JSON.
    -- Contém todas as informações necessárias para os serviços consumidores.
    payload        JSONB        NOT NULL,

    -- Data e hora em que o evento foi gerado
    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_saida_identity_criado_em ON eventos_saida (criado_em);
