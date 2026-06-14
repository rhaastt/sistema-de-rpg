'use client';

import { useActionState } from 'react';
import { sendInviteAction } from '@/features/invitations/actions/invitation.actions';
import type { ActionResult } from '@/shared/types/action-result';
import type { Invite } from '@/domain/invitation/types';

const initialState: ActionResult<Invite> = { success: true, data: undefined as unknown as Invite };

export function InviteForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, pending] = useActionState(sendInviteAction, initialState);

  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="campaignId" value={campaignId} />
      <input
        name="inviteeEmail"
        type="email"
        required
        placeholder="E-mail do jogador"
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? 'Enviando...' : 'Convidar'}
      </button>
      {!state.success && (
        <p className="mt-1 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
