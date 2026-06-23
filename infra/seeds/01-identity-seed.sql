-- Seeds do db_identity
-- Senha de todos os usuários: Prontumed@123
-- Hashes gerados com bcryptjs (cost=11) — compatível com BCrypt.Net-Next

INSERT INTO usuarios (id, email, hash_senha, primeiro_nome, sobrenome, perfil, ativo, criado_em, atualizado_em)
VALUES
  -- Administrador
  ('00000000-0000-0000-0000-000000000001',
   'admin@prontumed.com',
   '$2b$11$arkcXX8mzPOC5CLY6zyH8uUstydlFy2AedpSAWoHi0r.msTyfNihi',
   'Carlos', 'Mendes', 'Admin', true, NOW(), NOW()),

  -- Médicos
  ('00000000-0000-0000-0000-000000000010',
   'lucas@prontumed.com',
   '$2b$11$krIg2hdXuHX11qVAeN/C9OQqRrkCiImSgF8yYx2Tfdc4bMyYpvgNK',
   'Lucas', 'Andrade', 'Doctor', true, NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000011',
   'marina@prontumed.com',
   '$2b$11$8fOyFGnyTan4jAf2ZCuyqe2VkcZd3.Icq/Z.Pq/uBRhvTpdAt70lu',
   'Marina', 'Costa', 'Doctor', true, NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000012',
   'rafael@prontumed.com',
   '$2b$11$wXJ3D8KpCEG7rm/7Pa2S1OiKSpCExX49oNYzLN5iVyPwYql06WuMC',
   'Rafael', 'Souza', 'Doctor', true, NOW(), NOW()),

  -- Recepcionista
  ('00000000-0000-0000-0000-000000000020',
   'ana@prontumed.com',
   '$2b$11$nOFQjnrpBs6Wm7A1ri9D7OiF.vzwAZKg80lb8ghQrn.4mtrtemkE.',
   'Ana', 'Lima', 'Receptionist', true, NOW(), NOW()),

  -- Pacientes (também precisam de conta para login)
  ('10000000-0000-0000-0000-000000000001',
   'fernanda@prontumed.com',
   '$2b$11$HZ/zrBzCYkz8LAjAfBhh2.49bVkL5epnskej60HexEqb1i1S94s9C',
   'Fernanda', 'Oliveira', 'Patient', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000002',
   'ricardo@prontumed.com',
   '$2b$11$f9gBQ36LbEV2y3PDLx8ztepx8W5EsHIQDNfhMzFqfEl6aTs6HPTKO',
   'Ricardo', 'Ferreira', 'Patient', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000003',
   'juliana@prontumed.com',
   '$2b$11$jM3HiBaaxdJNqzIbNHbm1OiaOfri34AsPnzGNoLMSx0TH67wopyxG',
   'Juliana', 'Santos', 'Patient', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000004',
   'marcos@prontumed.com',
   '$2b$11$S7yf3Z0sudqxuqftt1bQ1ecbz6irHQ1V91R1LylBw8uM6K3Iw447G',
   'Marcos', 'Almeida', 'Patient', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000005',
   'beatriz@prontumed.com',
   '$2b$11$BYwbr9r5ElHrZHzLsx6w3eY7dmq7InTGEiiTn024g6jtkqeMUwpcC',
   'Beatriz', 'Carvalho', 'Patient', false, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000006',
   'rodrigo@prontumed.com',
   '$2b$11$MEiufhhkMmA.L14g9vb7P.fbhx2xEPvBdGOeLjpgnuTF75Hw5JEye',
   'Rodrigo', 'Nascimento', 'Patient', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000007',
   'camila@prontumed.com',
   '$2b$11$stHwPD03MeV9.PAqjAcYjuzvVTNJjdVLU.jY.OWbXVTr1jJ5NbQGG',
   'Camila', 'Ribeiro', 'Patient', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000008',
   'eduardo@prontumed.com',
   '$2b$11$wBltuY92kT6hXrwDWnBubuZHF39aEr4HyJaqkVkyCdqMVMPYiA0Yu',
   'Eduardo', 'Pereira', 'Patient', true, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;
