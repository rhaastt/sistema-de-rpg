'use client';

import { useTransition } from 'react';
import { removeMemberAction } from '@/features/members/actions/member.actions';
import type { MemberWithProfile } from '@/domain/campaign/types';

interface Props {
  members: MemberWithProfile[];
  campaignId: string;
  isMaster: boolean;
  currentUserId: string;
}

export function MemberList({ members, campaignId, isMaster, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(userId: string) {
    startTransition(async () => {
      const result = await removeMemberAction(campaignId, userId);
      if (!result.success) alert(result.error);
    });
  }

  return (
    <ul className="divide-y divide-gray-100">
      {members.map((m) => (
        <li key={m.id} className="flex items-center justify-between py-3">
          <div>
            <span className="text-sm font-medium text-gray-900">{m.profile.displayName}</span>
            <span className="ml-2 text-xs text-gray-400">
              {m.role === 'master' ? 'Mestre' : 'Jogador'}
            </span>
          </div>
          {isMaster && m.role !== 'master' && m.userId !== currentUserId && (
            <button
              onClick={() => handleRemove(m.userId)}
              disabled={isPending}
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              Remover
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
