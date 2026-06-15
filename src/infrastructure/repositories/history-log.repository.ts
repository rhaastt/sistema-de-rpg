import type { CelestiaClient } from '@/shared/types/supabase-client';
import type { Database } from '@/shared/types/database';
import type { HistoryEntryWithActor } from '@/domain/history/types';

type Client = CelestiaClient;
type LogRow = Database['public']['Tables']['history_log']['Row'];
type LogInsert = Database['public']['Tables']['history_log']['Insert'];

export async function insertHistoryEvent(supabase: Client, entry: LogInsert): Promise<void> {
  const { error } = await (supabase.from('history_log') as any).insert(entry);
  if (error) throw error;
}

export async function getHistoryForCampaign(
  supabase: Client,
  campaignId: string,
  limit = 50,
): Promise<HistoryEntryWithActor[]> {
  const { data: logsRaw, error } = await supabase
    .from('history_log')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('occurred_at', { ascending: false })
    .limit(limit);
  if (error || !logsRaw) return [];

  const logs = logsRaw as LogRow[];
  const actorIds = [...new Set(logs.map((l) => l.actor_id).filter((id): id is string => id !== null))];

  if (actorIds.length === 0) {
    return logs.map((l) => ({
      id: l.id,
      campaignId: l.campaign_id,
      actorId: l.actor_id,
      eventType: l.event_type,
      metadata: l.metadata,
      occurredAt: l.occurred_at,
      actorName: null,
    }));
  }

  const { data: profilesRaw } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', actorIds);

  const profiles = (profilesRaw as { id: string; display_name: string }[] | null) ?? [];
  const nameMap = new Map(profiles.map((p) => [p.id, p.display_name]));

  return logs.map((l) => ({
    id: l.id,
    campaignId: l.campaign_id,
    actorId: l.actor_id,
    eventType: l.event_type,
    metadata: l.metadata,
    occurredAt: l.occurred_at,
    actorName: l.actor_id ? (nameMap.get(l.actor_id) ?? null) : null,
  }));
}
