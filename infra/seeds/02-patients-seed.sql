-- Seeds do db_patients
-- id_usuario referencia o id em db_identity.usuarios (referência lógica, sem FK cross-banco)

INSERT INTO pacientes (id, id_usuario, primeiro_nome, sobrenome, cpf, data_nascimento, sexo, telefone, email, ativo, criado_em, atualizado_em)
VALUES
  ('10000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'Fernanda', 'Oliveira', '12345678901', '1990-03-15', 'F',
   '(11) 98765-4321', 'fernanda@prontumed.com', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000002',
   'Ricardo', 'Ferreira', '23456789012', '1978-07-22', 'M',
   '(21) 91234-5678', 'ricardo@prontumed.com', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000003',
   'Juliana', 'Santos', '34567890123', '1995-11-08', 'F',
   '(31) 99876-5432', 'juliana@prontumed.com', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000004',
   'Marcos', 'Almeida', '45678901234', '1965-02-28', 'M',
   '(41) 92345-6789', 'marcos@prontumed.com', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000005',
   'Beatriz', 'Carvalho', '56789012345', '2002-09-14', 'F',
   '(51) 98123-4567', 'beatriz@prontumed.com', false, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000006',
   'Rodrigo', 'Nascimento', '67890123456', '1988-05-30', 'M',
   '(61) 93456-7890', 'rodrigo@prontumed.com', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000007',
   '10000000-0000-0000-0000-000000000007',
   'Camila', 'Ribeiro', '78901234567', '2000-12-01', 'F',
   '(71) 94567-8901', 'camila@prontumed.com', true, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000008',
   '10000000-0000-0000-0000-000000000008',
   'Eduardo', 'Pereira', '89012345678', '1972-06-17', 'M',
   '(81) 95678-9012', 'eduardo@prontumed.com', true, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;
