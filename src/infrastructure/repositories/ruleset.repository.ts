import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';
import type { Race, RulesetClass, Specialization } from '@/domain/ruleset/types';

type Client = SupabaseClient<Database>;

export async function getRaces(supabase: Client): Promise<Race[]> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    active: r.active,
    createdAt: r.created_at,
  }));
}

export async function getRaceByName(supabase: Client, name: string): Promise<Race | null> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('name', name)
    .single();
  if (error) return null;
  if (!data) return null;
  return { id: data.id, name: data.name, description: data.description, active: data.active, createdAt: data.created_at };
}

export async function getClasses(supabase: Client): Promise<RulesetClass[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    active: c.active,
    createdAt: c.created_at,
  }));
}

export async function getClassById(supabase: Client, id: string): Promise<RulesetClass | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  if (!data) return null;
  return { id: data.id, name: data.name, description: data.description, active: data.active, createdAt: data.created_at };
}

export async function getAllSpecializations(supabase: Client): Promise<Specialization[]> {
  const { data, error } = await supabase
    .from('specializations')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    classId: s.class_id,
    name: s.name,
    description: s.description,
    active: s.active,
    createdAt: s.created_at,
  }));
}
