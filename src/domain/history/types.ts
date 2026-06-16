import type { HistoryEventType, Json } from '@/shared/types/database';

export type { HistoryEventType };

export interface HistoryEntry {
  id: string;
  campaignId: string;
  actorId: string | null;
  eventType: HistoryEventType;
  metadata: Json;
  occurredAt: string;
}

export interface HistoryEntryWithActor extends HistoryEntry {
  actorName: string | null;
}
