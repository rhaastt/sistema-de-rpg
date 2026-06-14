import type { InviteStatus } from '@/shared/types/database';

export type { InviteStatus };

export interface Invite {
  id: string;
  campaignId: string;
  inviterId: string;
  inviteeId: string;
  status: InviteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InviteWithDetails extends Invite {
  campaignName: string;
  inviterName: string;
  inviteeName: string;
}
