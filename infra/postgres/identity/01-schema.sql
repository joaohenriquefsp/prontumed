-- =============================================================
-- BANCO: db_identity
-- SERVIÇO: Identity Service
-- RESPONSABILIDADE: Autenticação, gestão de usuários e controle
--                   de acesso ao sistema (quem pode entrar e com
--                   qual perfil).
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: users  (Usuários do sistema)
-- -------------------------------------------------------------
-- Armazena todos os usuários cadastrados, independente do perfil.
-- Um usuário pode ser: Paciente, Médico, Recepcionista ou Admin.
-- O campo "role" (perfil) é usado pelo BFF para decidir quais
-- rotas e dados cada usuário pode acessar (controle RBAC).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (

    -- Identificador único do usuário (gerado automaticamente pelo banco)
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- E-mail de login — deve ser único no sistema
    email         VARCHAR(255) NOT NULL UNIQUE,

    -- Senha armazenada como hash (nunca em texto puro)
    -- Algoritmo utilizado: BCrypt (definido na camada de aplicação)
    password_hash VARCHAR(255) NOT NULL,

    -- Nome e sobrenome do usuário
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,

    -- Perfil de acesso do usuário no sistema.
    -- Valores possíveis: 'Patient' | 'Doctor' | 'Receptionist' | 'Admin'
    -- Este campo é incluído no token JWT e validado pelo BFF em cada requisição.
    role          VARCHAR(50)  NOT NULL,

    -- Indica se o usuário está ativo. Usuários inativos não conseguem fazer login.
    -- Usamos exclusão lógica (soft delete) para manter histórico — exigência da LGPD.
    is_active     BOOLEAN      NOT NULL DEFAULT true,

    -- Data e hora de criação do registro (preenchida automaticamente)
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Data e hora da última atualização (deve ser atualizada pela aplicação)
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- -------------------------------------------------------------
-- TABELA: refresh_tokens  (Tokens de renovação de sessão)
-- -------------------------------------------------------------
-- Quando um usuário faz login, ele recebe dois tokens:
--   1. Access token (JWT) — válido por 15 minutos, fica na memória
--   2. Refresh token — válido por 7 dias, fica salvo nesta tabela
--
-- Quando o access token expira, o sistema usa o refresh token
-- para gerar um novo par de tokens sem pedir nova senha.
-- Ao fazer logout, o refresh token é revogado (revoked_at preenchido).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (

    -- Identificador único do token
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuário dono deste token
    -- ON DELETE CASCADE: se o usuário for removido, seus tokens também são
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- O token em si é armazenado como hash por segurança.
    -- O valor original é enviado ao cliente, mas aqui guardamos apenas o hash.
    token_hash  VARCHAR(255) NOT NULL UNIQUE,

    -- Data/hora em que este token deixa de ser válido (hoje + 7 dias)
    expires_at  TIMESTAMPTZ  NOT NULL,

    -- Preenchido quando o usuário faz logout ou o token é invalidado manualmente.
    -- Token com revoked_at preenchido é recusado mesmo que ainda não tenha expirado.
    revoked_at  TIMESTAMPTZ,

    -- Data/hora em que o token foi criado
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);


-- =============================================================
-- TABELA: outbox_events  (Fila de saída de eventos — Padrão Outbox)
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
CREATE TABLE IF NOT EXISTS outbox_events (

    -- Identificador único do evento
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo do agregado que gerou o evento.
    -- Usado pelo Debezium para decidir em qual tópico Kafka publicar.
    -- Exemplo: 'User' → publica no tópico 'prontumed.User'
    aggregate_type VARCHAR(100) NOT NULL,

    -- ID da entidade que gerou o evento.
    -- Vira a chave (key) da mensagem no Kafka, garantindo que eventos
    -- do mesmo agregado fiquem na mesma partição e em ordem.
    aggregate_id   UUID         NOT NULL,

    -- Nome do evento ocorrido.
    -- Exemplos: 'UserCreated' | 'UserRoleChanged' | 'PasswordReset'
    type           VARCHAR(150) NOT NULL,

    -- Dados completos do evento em formato JSON.
    -- Contém todas as informações necessárias para os serviços consumidores.
    payload        JSONB        NOT NULL,

    -- Data e hora em que o evento foi gerado
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_identity_created_at ON outbox_events (created_at);
