-- Seed idempotente de raças
-- Raças base + Anumanos do Celestia
INSERT INTO races (name, description) VALUES
  ('Humano',   'Versáteis e adaptáveis; recebem mais perícias na criação.'),
  ('Elfo',     'Ágeis e perspicazes, com afinidade natural com a magia.'),
  ('Anão',     'Resistentes e determinados, forjados entre pedra e metal.'),
  ('Ogro',     'Imensos e brutais; possuem a perícia racial Brutamontes.'),
  ('Bruxa',    'Raça das Bruxas; necessária para escolher a classe Bruxa.'),
  -- Anumanos
  ('Diffo',    'Anumano com traços de ave; leve e perspicaz.'),
  ('Feral',    'Anumano com instintos selvagens aguçados.'),
  ('Gwyrá',    'Anumano de origem florestal, sintonizado com a natureza.'),
  ('Kãngues',  'Anumano ágil com poderosas pernas traseiras.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
