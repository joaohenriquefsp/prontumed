-- =============================================================
-- BANCO: db_notifications  (Banco de notificações)
-- SERVIÇO: Notification Service
-- RESPONSABILIDADE: Envio de notificações para pacientes e médicos.
--                   Este serviço é um "worker puro": ele APENAS CONSOME
--                   eventos do Kafka e dispara notificações (e-mail e push).
--                   Nunca produz eventos, por isso NÃO tem tabela outbox_events.
--
-- COMO FUNCIONA:
--   1. Appointment Service publica 'AppointmentScheduled' no Kafka
--   2. Este worker consome o evento
--   3. Busca o modelo de notificação correspondente (tabela abaixo)
--   4. Envia e-mail e/ou push para o paciente e o médico
--   5. Registra o resultado do envio (tabela de log abaixo)
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: delivery_logs  (Histórico de notificações enviadas)
-- -------------------------------------------------------------
-- delivery_logs = log de entregas de notificações
--
-- Registra cada tentativa de envio de notificação: se foi bem-sucedida,
-- se falhou e o motivo da falha. Permite reenvio e diagnóstico de problemas.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_logs (

    -- Identificador único deste registro de entrega
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID do evento Kafka que originou esta notificação.
    -- Permite rastrear qual agendamento ou ação gerou este envio.
    event_id     UUID         NOT NULL,

    -- Tipo do evento que gerou a notificação.
    -- Ex: 'AppointmentScheduled' | 'AppointmentCancelled' | 'AppointmentCompleted'
    event_type   VARCHAR(150) NOT NULL,

    -- ID do usuário que recebeu (ou deveria ter recebido) a notificação
    -- (ref ao Identity Service, sem FK real)
    recipient_id UUID         NOT NULL,

    -- Canal de entrega utilizado:
    --   'Email' → enviado por e-mail
    --   'Push'  → notificação push no aplicativo mobile
    channel      VARCHAR(20)  NOT NULL,

    -- Resultado da tentativa de entrega:
    --   'Pending' → ainda não processado
    --   'Sent'    → enviado com sucesso
    --   'Failed'  → falhou (ver error_message)
    status       VARCHAR(20)  NOT NULL DEFAULT 'Pending',

    -- Data e hora em que a notificação foi efetivamente enviada
    -- (nulo se ainda não foi enviada ou se falhou)
    sent_at      TIMESTAMPTZ,

    -- Descrição do erro caso o envio tenha falhado
    -- Ex: 'Invalid email address' | 'Push token expired'
    error_message TEXT,

    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_logs_event_id     ON delivery_logs (event_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_recipient_id ON delivery_logs (recipient_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status       ON delivery_logs (status);


-- -------------------------------------------------------------
-- TABELA: notification_templates  (Modelos de mensagem)
-- -------------------------------------------------------------
-- notification_templates = modelos de notificação
--
-- Armazena os textos das notificações para cada tipo de evento e canal.
-- Usa variáveis no formato {{nome_variavel}} que são substituídas
-- pelo worker no momento do envio com os dados reais do evento.
--
-- Ex: "Olá {{patient_name}}, sua consulta com Dr(a). {{doctor_name}}
--      foi agendada para {{scheduled_at}}."
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_templates (

    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo de evento ao qual este modelo se aplica
    -- Ex: 'AppointmentScheduled' | 'AppointmentCancelled'
    event_type    VARCHAR(150) NOT NULL,

    -- Canal ao qual este modelo se aplica: 'Email' | 'Push'
    -- Push não tem assunto (subject), apenas o corpo da mensagem
    channel       VARCHAR(20)  NOT NULL,

    -- Assunto do e-mail (preenchido apenas quando channel = 'Email')
    subject       VARCHAR(255),

    -- Corpo da mensagem com variáveis substituíveis.
    -- As variáveis {{...}} são preenchidas pelo worker com dados do evento.
    body_template TEXT         NOT NULL,

    -- Permite desativar um modelo sem deletá-lo
    is_active     BOOLEAN      NOT NULL DEFAULT true,

    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Cada combinação evento + canal tem apenas um modelo ativo
    UNIQUE (event_type, channel)
);


-- =============================================================
-- DADOS INICIAIS — Modelos padrão do sistema
-- =============================================================
-- Inseridos na criação do banco para que o worker já funcione
-- assim que o primeiro evento chegar.
-- ON CONFLICT: se os dados já existirem (ex: reinicialização do
-- container), ignora sem gerar erro.
-- =============================================================
INSERT INTO notification_templates (event_type, channel, subject, body_template) VALUES

  -- Consulta agendada → notifica paciente por e-mail
  ('AppointmentScheduled', 'Email',
   'Consulta confirmada — ProntuMed',
   'Olá {{patient_name}}, sua consulta com Dr(a). {{doctor_name}} foi agendada para {{scheduled_at}}. Em caso de dúvidas, entre em contato com a clínica.'),

  -- Consulta agendada → notificação push no app do paciente
  ('AppointmentScheduled', 'Push',
   NULL,
   'Consulta agendada para {{scheduled_at}} com Dr(a). {{doctor_name}}.'),

  -- Consulta cancelada → notifica paciente por e-mail
  ('AppointmentCancelled', 'Email',
   'Consulta cancelada — ProntuMed',
   'Olá {{patient_name}}, sua consulta do dia {{scheduled_at}} com Dr(a). {{doctor_name}} foi cancelada. Motivo: {{reason}}.'),

  -- Consulta cancelada → notificação push no app do paciente
  ('AppointmentCancelled', 'Push',
   NULL,
   'Sua consulta do dia {{scheduled_at}} foi cancelada.'),

  -- Consulta realizada → push pedindo avaliação ao paciente
  ('AppointmentCompleted', 'Push',
   NULL,
   'Consulta concluída! Como foi sua experiência com Dr(a). {{doctor_name}}?')

ON CONFLICT (event_type, channel) DO NOTHING;
