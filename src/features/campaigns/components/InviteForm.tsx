'use client';

import { useActionState } from 'react';
import { Button } from '@/shared/ui';
import { sendInviteAction } from '@/features/invitations/actions/invitation.actions';
import type { ActionResult } from '@/shared/types/action-result';
import type { Invite } from '@/domain/invitation/types';

const initialState: ActionResult<Invite> = { success: true, data: undefined as unknown as Invite };

export function InviteForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, pending] = useActionState(sendInviteAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="campaignId" value={campaignId} />
      <div className="flex gap-2">
        <input
          name="inviteeEmail"
          type="email"
          required
          placeholder="E-mail do jogador"
          className="h-[42px] flex-1 rounded-control border-2 border-stroke-subtle bg-input px-3 text-body text-content placeholder:text-content-secondary/70 focus:border-stroke-active focus:outline-none"
        />
        <Button type="submit" size="small" disabled={pending}>
          {pending ? 'Enviando...' : 'Convidar'}
        </Button>
      </div>
      {!state.success && <p className="text-small text-content">{state.error}</p>}
    </form>
  );
}
