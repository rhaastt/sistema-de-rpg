import type { CampaignStatus, MemberRole } from '@/shared/types/database';

export type { CampaignStatus, MemberRole };

export interface Campaign {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  removedAt: string | null;
}

export interface CampaignWithRole extends Campaign {
  role: MemberRole;
}

export interface MemberWithProfile extends CampaignMember {
  profile: { id: string; displayName: string; avatarUrl: string | null };
}
