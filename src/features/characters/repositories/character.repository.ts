import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { Character, CharacterAttributes, CharacterClass, CharacterFullView } from '@/domain/character/types';

type Client = CelestiaClient;
type CharRow = Database['public']['Tables']['characters']['Row'];
type CharClassRow = Database['public']['Tables']['character_classes']['Row'];
type CharAttrRow = Database['public']['Tables']['character_attributes']['Row'];

function rowToCharacter(r: CharRow): Character {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    ownerId: r.owner_id,
    name: r.name,
    imageUrl: r.image_url,
    sex: r.sex,
    age: r.age,
    raceId: r.race_id,
    region: r.region,
    visualDescription: r.visual_description,
    background: r.background,
    status: r.status,
    sheetLocked: r.sheet_locked,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getCharacterById(supabase: Client, id: string): Promise<Character | null> {
  const { data, error } = await supabase.from('characters').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToCharacter(data as CharRow);
}

export async function getCharactersForCampaign(supabase: Client, campaignId: string): Promise<Character[]> {
  const { data, error } = await supabase.from('characters').select('*').eq('campaign_id', campaignId).order('name');
  if (error || !data) return [];
  return (data as CharRow[]).map(rowToCharacter);
}

export async function getCharacterByOwnerAndCampaign(supabase: Client, ownerId: string, campaignId: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('campaign_id', campaignId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCharacter(data as CharRow);
}

export async function getCharacterFullView(supabase: Client, id: string): Promise<CharacterFullView | null> {
  const character = await getCharacterById(supabase, id);
  if (!character) return null;

  const [
    { data: raceData },
    { data: classesRaw },
    { data: attrsRaw },
  ] = await Promise.all([
    supabase.from('races').select('name').eq('id', character.raceId).maybeSingle(),
    supabase.from('character_classes').select('*').eq('character_id', id),
    supabase.from('character_attributes').select('*').eq('character_id', id).maybeSingle(),
  ]);

  const classesData = (classesRaw as CharClassRow[] | null) ?? [];
  const attrsData = attrsRaw as CharAttrRow | null;
  const raceName = (raceData as { name: string } | null)?.name ?? '';

  const classIds = classesData.map((cc) => cc.class_id);
  const specIds = classesData.map((cc) => cc.specialization_id);

  const [{ data: classNamesRaw }, { data: specNamesRaw }] = await Promise.all([
    classIds.length > 0 ? supabase.from('classes').select('id, name').in('id', classIds) : Promise.resolve({ data: [] }),
    specIds.length > 0 ? supabase.from('specializations').select('id, name').in('id', specIds) : Promise.resolve({ data: [] }),
  ]);

  const classNames = (classNamesRaw as { id: string; name: string }[] | null) ?? [];
  const specNames = (specNamesRaw as { id: string; name: string }[] | null) ?? [];

  const classMap = new Map(classNames.map((c) => [c.id, c.name]));
  const specMap = new Map(specNames.map((s) => [s.id, s.name]));

  const classes: CharacterFullView['classes'] = classesData.map((cc) => ({
    id: cc.id,
    characterId: cc.character_id,
    slot: cc.slot,
    classId: cc.class_id,
    specializationId: cc.specialization_id,
    className: classMap.get(cc.class_id) ?? '',
    specializationName: specMap.get(cc.specialization_id) ?? '',
  }));

  const attributes: CharacterAttributes = attrsData
    ? {
        id: attrsData.id,
        characterId: attrsData.character_id,
        strength: attrsData.strength,
        dexterity: attrsData.dexterity,
        constitution: attrsData.constitution,
        intelligence: attrsData.intelligence,
        mind: attrsData.mind,
        charisma: attrsData.charisma,
        updatedAt: attrsData.updated_at,
      }
    : { id: '', characterId: id, strength: 0, dexterity: 0, constitution: 0, intelligence: 0, mind: 0, charisma: 0, updatedAt: '' };

  return { ...character, raceName, classes, attributes };
}

export async function createCharacter(
  supabase: Client,
  payload: Database['public']['Tables']['characters']['Insert'],
): Promise<Character> {
  const { data, error } = await supabase.from('characters').insert(payload as any).select().single();
  if (error || !data) throw error ?? new Error('Falha ao criar personagem');
  return rowToCharacter(data as CharRow);
}

export async function updateCharacter(
  supabase: Client,
  id: string,
  payload: Database['public']['Tables']['characters']['Update'],
): Promise<Character> {
  const { data, error } = await (supabase.from('characters') as any).update(payload).eq('id', id).select().single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar personagem');
  return rowToCharacter(data as CharRow);
}

export async function upsertCharacterClasses(
  supabase: Client,
  classes: Array<{ characterId: string; slot: '1' | '2'; classId: string; specializationId: string }>,
): Promise<CharacterClass[]> {
  const rows = classes.map((c) => ({
    character_id: c.characterId,
    slot: c.slot,
    class_id: c.classId,
    specialization_id: c.specializationId,
  }));
  const { data, error } = await supabase.from('character_classes').upsert(rows as any, { onConflict: 'character_id,slot' }).select();
  if (error || !data) throw error ?? new Error('Falha ao salvar classes');
  return (data as CharClassRow[]).map((cc) => ({
    id: cc.id,
    characterId: cc.character_id,
    slot: cc.slot,
    classId: cc.class_id,
    specializationId: cc.specialization_id,
  }));
}

export async function insertCharacterSkills(
  supabase: Client,
  characterId: string,
  skillIds: string[],
  origin: Database['public']['Enums']['skill_origin'] = 'criacao',
): Promise<void> {
  if (skillIds.length === 0) return;
  const rows = skillIds.map((skillId) => ({ character_id: characterId, skill_id: skillId, origin }));
  // Sem .select(): evita o gotcha do RETURNING sob RLS.
  const { error } = await supabase.from('character_skills').insert(rows as any);
  if (error) throw error;
}

export async function updateCharacterAttributes(
  supabase: Client,
  characterId: string,
  attrs: Database['public']['Tables']['character_attributes']['Update'],
): Promise<CharacterAttributes> {
  const { data, error } = await (supabase.from('character_attributes') as any)
    .update(attrs)
    .eq('character_id', characterId)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar atributos');
  const d = data as CharAttrRow;
  return {
    id: d.id,
    characterId: d.character_id,
    strength: d.strength,
    dexterity: d.dexterity,
    constitution: d.constitution,
    intelligence: d.intelligence,
    mind: d.mind,
    charisma: d.charisma,
    updatedAt: d.updated_at,
  };
}
