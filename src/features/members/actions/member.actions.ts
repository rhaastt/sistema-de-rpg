'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/infrastructure/supabase/server';
import { requireAuthUser } from '@/shared/auth/session';
import { domainErrorMessage } from '@/shared/errors';
import type { ActionResult } from '@/shared/types/action-result';
import * as service from '@/features/members/services/member.service';

export async function removeMemberAction(
  campaignId: string,
  targetUserId: string,
): Promise<ActionResult> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    await service.removeMember(supabase, user.id, campaignId, targetUserId);
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}
