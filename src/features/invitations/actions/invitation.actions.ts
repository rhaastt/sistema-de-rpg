'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { requireAuthUser } from '@/shared/auth/session';
import { domainErrorMessage } from '@/shared/errors';
import type { ActionResult } from '@/shared/types/action-result';
import type { Invite } from '@/domain/invitation/types';
import { SendInviteSchema } from '@/features/invitations/schemas';
import * as service from '@/features/invitations/services/invitation.service';

export async function sendInviteAction(formData: FormData): Promise<ActionResult<Invite>> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const parsed = SendInviteSchema.safeParse({
      campaignId: formData.get('campaignId'),
      inviteeEmail: formData.get('inviteeEmail'),
    });
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

    const invite = await service.sendInvite(supabase, user.id, parsed.data);
    revalidatePath(`/campaigns/${parsed.data.campaignId}`);
    return { success: true, data: invite };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function acceptInviteAction(inviteId: string): Promise<void> {
  const user = await requireAuthUser();
  const supabase = await createClient();
  const invite = await service.acceptInvite(supabase, user.id, inviteId);
  redirect(`/campaigns/${invite.campaignId}`);
}

export async function declineInviteAction(inviteId: string): Promise<ActionResult> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    await service.declineInvite(supabase, user.id, inviteId);
    revalidatePath('/campaigns');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}

export async function cancelInviteAction(
  campaignId: string,
  inviteId: string,
): Promise<ActionResult> {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    await service.cancelInvite(supabase, user.id, inviteId);
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: domainErrorMessage(e) };
  }
}
