import type { MemberRole } from '@/shared/types/database';

export type { MemberRole };

export interface Membership {
  id: string;
  campaignId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  removedAt: string | null;
}
