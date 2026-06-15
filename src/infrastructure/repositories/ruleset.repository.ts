import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { Race, RulesetClass, Specialization } from '@/domain/ruleset/types';

type Client = CelestiaClient;
type RaceRow = Database['public']['Tables']['races']['Row'];
type ClassRow = Database['public']['Tables']['classes']['Row'];
type SpecRow = Database['public']['Tables']['specializations']['Row'];

export async function getRaces(supabase: Client): Promise<Race[]> {
  const { data, error } = await supabase.from('races').select('*').eq('active', true).order('name');
  if (error) throw error;
  return ((data as RaceRow[] | null) ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    active: r.active,
    createdAt: r.created_at,
  }));
}

export async function getRaceByName(supabase: Client, name: string): Promise<Race | null> {
  const { data, error } = await supabase.from('races').select('*').eq('name', name).maybeSingle();
  if (error || !data) return null;
  const r = data as RaceRow;
  return { id: r.id, name: r.name, description: r.description, active: r.active, createdAt: r.created_at };
}

export async function getClasses(supabase: Client): Promise<RulesetClass[]> {
  const { data, error } = await supabase.from('classes').select('*').eq('active', true).order('name');
  if (error) throw error;
  return ((data as ClassRow[] | null) ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    active: c.active,
    createdAt: c.created_at,
  }));
}

export async function getClassById(supabase: Client, id: string): Promise<RulesetClass | null> {
  const { data, error } = await supabase.from('classes').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  const c = data as ClassRow;
  return { id: c.id, name: c.name, description: c.description, active: c.active, createdAt: c.created_at };
}

export async function getAllSpecializations(supabase: Client): Promise<Specialization[]> {
  const { data, error } = await supabase.from('specializations').select('*').eq('active', true).order('name');
  if (error) throw error;
  return ((data as SpecRow[] | null) ?? []).map((s) => ({
    id: s.id,
    classId: s.class_id,
    name: s.name,
    description: s.description,
    active: s.active,
    createdAt: s.created_at,
  }));
}
