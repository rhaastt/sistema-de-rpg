-- ============================================================
-- Catálogo de referência — promovido de seed para migration
-- ============================================================
-- Dados de referência exigidos pelo app (não dados de teste).
-- Ficam em migration para aplicarem em qualquer ambiente via
-- 'supabase db push' — o push NÃO roda seeds. Idempotente.

-- Seed idempotente de perícias — catálogo do Compêndio Celestia §6.
-- O número é REQUISITO de atributo (mínimo), não bônus. attribute=NULL e
-- requirement_value=NULL indicam perícia sem requisito.

INSERT INTO skills (name, attribute, requirement_value, description) VALUES
  ('Arremesso de Objetos Pesados', 'strength',      3, 'Arremessa objetos de grande peso.'),
  ('Brutamontes',                  'constitution',  5, 'Força bruta e robustez; pode ser racial (ex.: Ogros).'),
  ('Resiliência',                  'constitution',  3, 'Resiste a danos e condições adversas.'),
  ('RM/RF',                        'constitution',  3, 'Resistência mágica e física.'),
  ('Perseverança',                 'constitution',  3, 'Mantém-se firme sob pressão.'),
  ('Sobrevivência',                'constitution',  2, 'Sobrevive em ambientes hostis.'),
  ('Acrobata',                     'dexterity',     3, 'Manobras acrobáticas e equilíbrio.'),
  ('Abrir Fechaduras',             'dexterity',     2, 'Abre fechaduras e mecanismos.'),
  ('Furtividade',                  'dexterity',     3, 'Move-se sem ser notado.'),
  ('Ambidestro',                   'dexterity',     3, 'Usa ambas as mãos com igual destreza.'),
  ('Iniciativa',                   'dexterity',     2, 'Reage rapidamente.'),
  ('Adestrar Animais',             'charisma',      3, 'Treina e comanda animais.'),
  ('Negociar',                     'charisma',      3, 'Barganha e persuade em trocas.'),
  ('Tocar Instrumentos',           'charisma',      2, 'Executa música com instrumentos.'),
  ('Falar com Animais',            'charisma',      2, 'Comunica-se com animais.'),
  ('Atuação',                      'charisma',      3, 'Atua e dissimula com convicção.'),
  ('Detetive',                     'charisma',      3, 'Investiga e lê pessoas.'),
  ('Decifrar Objetos',             'intelligence',  3, 'Interpreta objetos e inscrições.'),
  ('Telecinese',                   'intelligence',  3, 'Move objetos com a mente.'),
  ('Detectar Pensamentos',         'intelligence',  2, 'Percebe pensamentos próximos.'),
  ('Afinidade Elemental',          'intelligence',  2, 'Sintonia com um elemento (fogo/água/terra/ar).'),
  ('Conhecimento de Alquimia',     NULL,         NULL, 'Saber alquímico, sem requisito.'),
  ('Culinária',                    NULL,         NULL, 'Preparo de alimentos, sem requisito.'),
  ('Lobo Solitário',               NULL,         NULL, 'Perícia especial, sem requisito.')
ON CONFLICT (name) DO UPDATE SET
  attribute         = EXCLUDED.attribute,
  requirement_value = EXCLUDED.requirement_value,
  description       = EXCLUDED.description,
  active            = TRUE;
