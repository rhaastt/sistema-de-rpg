-- ============================================================
-- Catálogo de referência — promovido de seed para migration
-- ============================================================
-- Dados de referência exigidos pelo app (não dados de teste).
-- Ficam em migration para aplicarem em qualquer ambiente via
-- 'supabase db push' — o push NÃO roda seeds. Idempotente.

-- Seed idempotente de raças — catálogo do Compêndio Celestia §4.
-- Cada raça: descrição (com passivas), pool de Pontos de Atributo e
-- modificadores raciais por atributo (JSONB; chaves dos 6 atributos).
-- Anumanos ativos (decisão do mestre). Passivas como texto (interpretadas
-- pelo mestre) até a etapa de perícias estruturar as raciais.

INSERT INTO races (name, description, attribute_points, attribute_modifiers, active) VALUES
  -- Elfos
  ('Elfo Puro',         'Ágeis e perspicazes. Passivas: Visão no Escuro, Conhecimento de Runas.', 12, '{"dexterity":2,"intelligence":3,"charisma":-2,"strength":-2}', true),
  ('Meio-Elfo',         'Herança élfica diluída entre os povos. Passivas: Visão no Escuro.', 14, '{"dexterity":3,"charisma":-1}', true),
  ('Elfo do Deserto',   'Resistentes ao calor das terras áridas. Passivas: Visão no Escuro, Resistência ao Calor.', 12, '{"constitution":3,"strength":1,"dexterity":-3,"charisma":-1}', true),
  ('Elfo de Gelo',      'Adaptados ao frio extremo. Passivas: Visão no Escuro, Resistência ao Frio.', 12, '{"dexterity":3,"constitution":-3}', true),
  -- Ogros
  ('Ogro Puro',         'Imensos e brutais. Passivas: Brutamontes (perícia racial, não consome escolha).', 12, '{"strength":3,"constitution":4,"intelligence":-5,"dexterity":-3}', true),
  ('Meio-Ogro',         'Força ogra temperada por sangue humano. Passivas: Brutamontes.', 14, '{"strength":2,"constitution":2,"intelligence":-2,"dexterity":-1}', true),
  ('Ogro do Deserto',   'Ogros das terras quentes. Passivas: Resistência ao Calor, Brutamontes.', 12, '{"strength":2,"constitution":3,"intelligence":-4,"dexterity":-2}', true),
  ('Ogro das Cavernas', 'Ogros subterrâneos. Passivas: Visão no Escuro, Brutamontes.', 12, '{"strength":2,"constitution":3,"intelligence":-4,"dexterity":-2}', true),
  -- Goblins
  ('Goblin Puro',       'Pequenos e numerosos. Passivas: Mentalidade de Horda (interpretada pelo mestre).', 12, '{"dexterity":3,"mind":7,"strength":-5,"constitution":-5}', true),
  ('Grangoblin',        'Goblins avantajados e brutos. Sem passivas.', 12, '{"strength":4,"constitution":3,"dexterity":-3,"intelligence":-5}', true),
  ('Goblin Gurin',      'Goblins de mente aguçada. Sem passivas.', 12, '{"intelligence":5,"mind":10,"constitution":-5,"strength":-4}', true),
  -- Anões
  ('Anão das Cavernas', 'Construtores subterrâneos. Passivas: Visão no Escuro, Afinidade com Construções, Conhecimento de Materiais.', 12, '{"intelligence":4,"strength":3,"constitution":1,"dexterity":-3}', true),
  ('Anão das Montanhas','Forjadores das alturas. Passivas: Afinidade com Ferraria, Conhecimento de Materiais.', 12, '{"strength":4,"constitution":3,"intelligence":2,"dexterity":-3}', true),
  -- Outras
  ('Humano',            'Versáteis e determinados. Passivas: +1 Perícia na criação, Adaptabilidade ao Ambiente, Determinação ao Cair.', 16, '{}', true),
  ('Golem',             'Construto resistente e lento. Passivas: Escudo Mágico (anula o primeiro golpe mágico do combate).', 12, '{"constitution":6,"dexterity":-7}', true),
  ('Kobolt',            'Pequenos e farejadores. Passivas: Resistência ao Frio, Olfato Aprimorado.', 12, '{"dexterity":3,"constitution":-3,"mind":-6}', true),
  ('Ninfa',             'Seres feéricos ligados aos elementos. Passivas: Afinidade Elemental, Falar com os Animais.', 12, '{"intelligence":7,"constitution":-6}', true),
  ('Bruxa',             'Raça das Bruxas; somente mulheres. Passivas: Skills Próprias. Necessária para a classe Bruxa.', 12, '{}', true),
  ('Tiefling',          'Marcados por herança infernal. Passivas: Visão no Escuro, Detecção de Bem e Mal.', 12, '{"dexterity":3,"charisma":-2}', true),
  ('Gnomo',             'Inventivos e curiosos. Sem passivas.', 12, '{"intelligence":5,"mind":5,"constitution":-7}', true),
  ('Lagarto',           'Reptilianos de sangue frio. Passivas: Resistência ao Calor +2, Fraqueza ao Frio -3, Detectar Presença.', 12, '{"dexterity":3,"constitution":-3}', true),
  ('Draconato',         'Descendentes de dragões. Passivas: Imunidade ao Fogo Natural, Resistência ao Calor +5, Fraqueza ao Frio -6, Polimorfia para partes de dragão.', 12, '{"constitution":5,"strength":3,"intelligence":-3}', true),
  ('Whipear',           'Criaturas noturnas e sanguinárias. Passivas: Visão no Escuro, Buff Noturno +6 (exceto Mente), Debuff Diurno -6, Hemomancia.', 12, '{}', true),
  ('Serpirion',         'Serpentinos furtivos. Passivas: Resistência ao Calor, Fraqueza ao Frio, Detectar Presença, Fingir de Morto, Fatalidade.', 12, '{"dexterity":7,"constitution":-4,"strength":-2}', true),
  -- Anumanos (Kattawood)
  ('Anumano Diffo',     'Anumano de sentidos aguçados. Passivas: Audição Aprimorada, Visão de Terreno Aprimorada, Detecção de Perigo.', 12, '{"strength":5,"intelligence":3,"mind":7,"dexterity":-4,"constitution":-5}', true),
  ('Anumano Feral',     'Anumano de instintos selvagens. Passivas: Audição Apurada, Olfato Apurado, Perícia de Acrobacia (conforme a linhagem).', 12, '{"strength":4,"dexterity":4,"constitution":-5,"charisma":-3}', true),
  ('Anumano Gwyrá',     'Anumano alado de visão de rapina. Passivas: Foco Ocular, Vôo.', 12, '{"dexterity":7,"mind":4,"strength":-5,"constitution":-5}', true),
  ('Anumano Kãngues',   'Anumano aquático e robusto. Passivas: Respiração Subaquática, Visão Subaquática, Vantagem em Combate Aquático.', 12, '{"constitution":8,"strength":5,"dexterity":-6,"mind":-5}', true)
ON CONFLICT (name) DO UPDATE SET
  description         = EXCLUDED.description,
  attribute_points    = EXCLUDED.attribute_points,
  attribute_modifiers = EXCLUDED.attribute_modifiers,
  active              = EXCLUDED.active;

-- Remove raças fora do catálogo do Compêndio (ex.: 'Elfo', 'Anão', 'Ogro'
-- genéricos e Anumanos sem prefixo do seed antigo), preservando qualquer
-- uma já referenciada por um personagem.
DELETE FROM races r
WHERE r.name NOT IN (
  'Elfo Puro','Meio-Elfo','Elfo do Deserto','Elfo de Gelo',
  'Ogro Puro','Meio-Ogro','Ogro do Deserto','Ogro das Cavernas',
  'Goblin Puro','Grangoblin','Goblin Gurin',
  'Anão das Cavernas','Anão das Montanhas',
  'Humano','Golem','Kobolt','Ninfa','Bruxa','Tiefling','Gnomo',
  'Lagarto','Draconato','Whipear','Serpirion',
  'Anumano Diffo','Anumano Feral','Anumano Gwyrá','Anumano Kãngues'
)
AND NOT EXISTS (SELECT 1 FROM characters c WHERE c.race_id = r.id);
