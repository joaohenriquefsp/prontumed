-- =============================================================
-- BANCO: db_notifications  (Banco de notificações)
-- SERVIÇO: Notification Service
-- RESPONSABILIDADE: Envio de notificações para pacientes e médicos.
--                   Este serviço é um "worker puro": ele APENAS CONSOME
--                   eventos do Kafka e dispara notificações (e-mail e push).
--                   Nunca produz eventos, por isso NÃO tem tabela eventos_saida.
--
-- COMO FUNCIONA:
--   1. Appointment Service publica 'ConsultaAgendadaEvent' no Kafka
--   2. Este worker consome o evento
--   3. Busca o modelo de notificação correspondente (tabela abaixo)
--   4. Envia e-mail e/ou push para o paciente e o médico
--   5. Registra o resultado do envio (tabela de log abaixo)
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: logs_envio  (Histórico de notificações enviadas)
-- -------------------------------------------------------------
-- Registra cada tentativa de envio de notificação: se foi bem-sucedida,
-- se falhou e o motivo da falha. Permite reenvio e diagnóstico de problemas.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs_envio (

    -- Identificador único deste registro de entrega
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do evento Kafka que originou esta notificação.
    -- Permite rastrear qual agendamento ou ação gerou este envio.
    id_evento       UUID         NOT NULL,

    -- Tipo do evento que gerou a notificação (nome da classe do evento de domínio).
    -- Ex: 'ConsultaAgendadaEvent' | 'ConsultaCanceladaEvent' | 'ConsultaConcluidaEvent'
    tipo_evento     VARCHAR(150) NOT NULL,

    -- ID do usuário que recebeu (ou deveria ter recebido) a notificação
    -- (ref ao Identity Service, sem FK real)
    id_destinatario UUID         NOT NULL,

    -- Canal de entrega utilizado:
    --   'Email' → enviado por e-mail
    --   'Push'  → notificação push no aplicativo mobile
    canal           VARCHAR(20)  NOT NULL,

    -- Resultado da tentativa de entrega:
    --   'Pending' → ainda não processado
    --   'Sent'    → enviado com sucesso
    --   'Failed'  → falhou (ver mensagem_erro)
    status          VARCHAR(20)  NOT NULL DEFAULT 'Pending',

    -- Data e hora em que a notificação foi efetivamente enviada
    -- (nulo se ainda não foi enviada ou se falhou)
    enviado_em      TIMESTAMPTZ,

    -- Descrição do erro caso o envio tenha falhado
    -- Ex: 'Invalid email address' | 'Push token expired'
    mensagem_erro   TEXT,

    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_envio_id_evento       ON logs_envio (id_evento);
CREATE INDEX IF NOT EXISTS idx_logs_envio_id_destinatario ON logs_envio (id_destinatario);
CREATE INDEX IF NOT EXISTS idx_logs_envio_status          ON logs_envio (status);

-- Garante que o mesmo evento Kafka não gere duas notificações no mesmo canal
-- (idempotência sob entrega "at-least-once" do Kafka/Debezium)
CREATE UNIQUE INDEX IF NOT EXISTS idx_logs_envio_evento_canal ON logs_envio (id_evento, canal);


-- -------------------------------------------------------------
-- TABELA: modelos_notificacao  (Modelos de mensagem)
-- -------------------------------------------------------------
-- Armazena os textos das notificações para cada tipo de evento e canal.
-- Usa variáveis no formato {{nome_variavel}} que são substituídas
-- pelo worker no momento do envio com os dados reais do evento.
--
-- Ex: "Olá {{nome_paciente}}, sua consulta com Dr(a). {{nome_medico}}
--      foi agendada para {{data_hora}}."
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modelos_notificacao (

    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo de evento ao qual este modelo se aplica (nome da classe do evento de domínio)
    -- Ex: 'ConsultaAgendadaEvent' | 'ConsultaCanceladaEvent'
    tipo_evento  VARCHAR(150) NOT NULL,

    -- Canal ao qual este modelo se aplica: 'Email' | 'Push'
    -- Push não tem assunto (assunto), apenas o corpo da mensagem
    canal        VARCHAR(20)  NOT NULL,

    -- Assunto do e-mail (preenchido apenas quando canal = 'Email')
    assunto      VARCHAR(255),

    -- Corpo da mensagem com variáveis substituíveis.
    -- As variáveis {{...}} são preenchidas pelo worker com dados do evento.
    corpo_modelo TEXT         NOT NULL,

    -- Permite desativar um modelo sem deletá-lo
    ativo        BOOLEAN      NOT NULL DEFAULT true,

    criado_em    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Cada combinação evento + canal tem apenas um modelo ativo
    UNIQUE (tipo_evento, canal)
);


-- =============================================================
-- DADOS INICIAIS — Modelos padrão do sistema
-- =============================================================
-- Inseridos na criação do banco para que o worker já funcione
-- assim que o primeiro evento chegar.
-- ON CONFLICT: se os dados já existirem (ex: reinicialização do
-- container), ignora sem gerar erro.
-- =============================================================
INSERT INTO modelos_notificacao (tipo_evento, canal, assunto, corpo_modelo) VALUES

  -- Consulta agendada → notifica paciente por e-mail
  ('ConsultaAgendadaEvent', 'Email',
   'Consulta confirmada — ProntuMed',
   'Olá {{nome_paciente}}, sua consulta com Dr(a). {{nome_medico}} foi agendada para {{data_hora}}. Em caso de dúvidas, entre em contato com a clínica.'),

  -- Consulta agendada → notificação push no app do paciente
  ('ConsultaAgendadaEvent', 'Push',
   NULL,
   'Consulta agendada para {{data_hora}} com Dr(a). {{nome_medico}}.'),

  -- Consulta cancelada → notifica paciente por e-mail
  ('ConsultaCanceladaEvent', 'Email',
   'Consulta cancelada — ProntuMed',
   'Olá {{nome_paciente}}, sua consulta do dia {{data_hora}} com Dr(a). {{nome_medico}} foi cancelada. Motivo: {{motivo}}.'),

  -- Consulta cancelada → notificação push no app do paciente
  ('ConsultaCanceladaEvent', 'Push',
   NULL,
   'Sua consulta do dia {{data_hora}} foi cancelada.'),

  -- Consulta realizada → push pedindo avaliação ao paciente
  ('ConsultaConcluidaEvent', 'Push',
   NULL,
   'Consulta concluída! Como foi sua experiência com Dr(a). {{nome_medico}}?')

ON CONFLICT (tipo_evento, canal) DO NOTHING;
