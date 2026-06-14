import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import type {
  Character,
  CharacterAttributes,
  CharacterClass,
  CharacterFullView,
} from '@/domain/character/types';

type Client = SupabaseClient<Database>;

function rowToCharacter(r: Database['public']['Tables']['characters']['Row']): Character {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    ownerId: r.owner_id,
    name: r.name,
    imageUrl: r.image_url,
    sex: r.sex,
    age: r.age,
    raceId: r.race_id,
    visualDescription: r.visual_description,
    background: r.background,
    status: r.status,
    sheetLocked: r.sheet_locked,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getCharacterById(supabase: Client, id: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return rowToCharacter(data);
}

export async function getCharacterFullView(supabase: Client, id: string): Promise<CharacterFullView | null> {
  const { data, error } = await supabase
    .from('characters')
    .select(`
      *,
      races(name),
      character_classes(id, slot, class_id, specialization_id, classes(name), specializations(name)),
      character_attributes(*)
    `)
    .eq('id', id)
    .single();
  if (error || !data) return null;

  const attrs = data.character_attributes as unknown as {
    id: string; strength: number; dexterity: number; constitution: number;
    intelligence: number; mind: number; charisma: number; updated_at: string;
  } | null;

  return {
    ...rowToCharacter(data),
    raceName: (data.races as { name: string } | null)?.name ?? '',
    classes: ((data.character_classes ?? []) as unknown as Array<{
      id: string; slot: '1' | '2'; class_id: string; specialization_id: string;
      classes: { name: string } | null; specializations: { name: string } | null;
    }>).map((cc) => ({
      id: cc.id,
      characterId: id,
      slot: cc.slot,
      classId: cc.class_id,
      specializationId: cc.specialization_id,
      className: cc.classes?.name ?? '',
      specializationName: cc.specializations?.name ?? '',
    })),
    attributes: attrs
      ? {
          id: attrs.id,
          characterId: id,
          strength: attrs.strength,
          dexterity: attrs.dexterity,
          constitution: attrs.constitution,
          intelligence: attrs.intelligence,
          mind: attrs.mind,
          charisma: attrs.charisma,
          updatedAt: attrs.updated_at,
        }
      : { id: '', characterId: id, strength: 0, dexterity: 0, constitution: 0, intelligence: 0, mind: 0, charisma: 0, updatedAt: '' },
  };
}

export async function getCharactersForCampaign(supabase: Client, campaignId: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('name');
  if (error || !data) return [];
  return data.map(rowToCharacter);
}

export async function getCharacterByOwnerAndCampaign(
  supabase: Client,
  ownerId: string,
  campaignId: string,
): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('campaign_id', campaignId)
    .single();
  if (error || !data) return null;
  return rowToCharacter(data);
}

export async function createCharacter(
  supabase: Client,
  payload: Database['public']['Tables']['characters']['Insert'],
): Promise<Character> {
  const { data, error } = await supabase
    .from('characters')
    .insert(payload)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao criar personagem');
  return rowToCharacter(data);
}

export async function updateCharacter(
  supabase: Client,
  id: string,
  payload: Database['public']['Tables']['characters']['Update'],
): Promise<Character> {
  const { data, error } = await supabase
    .from('characters')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar personagem');
  return rowToCharacter(data);
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
  const { data, error } = await supabase
    .from('character_classes')
    .upsert(rows, { onConflict: 'character_id,slot' })
    .select();
  if (error || !data) throw error ?? new Error('Falha ao salvar classes do personagem');
  return data.map((cc) => ({
    id: cc.id,
    characterId: cc.character_id,
    slot: cc.slot,
    classId: cc.class_id,
    specializationId: cc.specialization_id,
  }));
}

export async function updateCharacterAttributes(
  supabase: Client,
  characterId: string,
  attrs: Database['public']['Tables']['character_attributes']['Update'],
): Promise<CharacterAttributes> {
  const { data, error } = await supabase
    .from('character_attributes')
    .update(attrs)
    .eq('character_id', characterId)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Falha ao atualizar atributos');
  return {
    id: data.id,
    characterId: data.character_id,
    strength: data.strength,
    dexterity: data.dexterity,
    constitution: data.constitution,
    intelligence: data.intelligence,
    mind: data.mind,
    charisma: data.charisma,
    updatedAt: data.updated_at,
  };
}
