'use client';

import { useTransition } from 'react';
import { Avatar } from '@/shared/ui';
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
    if (!confirm('Remover este jogador? O personagem dele será marcado como morto.')) return;
    startTransition(async () => {
      const result = await removeMemberAction(campaignId, userId);
      if (!result.success) alert(result.error);
    });
  }

  return (
    <ul className="flex flex-col gap-1">
      {members.map((m) => (
        <li key={m.id} className="flex items-center gap-3 rounded-control px-1 py-2">
          <Avatar src={m.profile.avatarUrl} name={m.profile.displayName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body text-content">{m.profile.displayName}</p>
            <p className="text-small text-content-secondary">
              {m.role === 'master' ? 'Mestre' : 'Jogador'}
            </p>
          </div>
          {isMaster && m.role !== 'master' && m.userId !== currentUserId && (
            <button
              onClick={() => handleRemove(m.userId)}
              disabled={isPending}
              className="text-small text-content-secondary hover:text-content hover:underline disabled:opacity-50"
            >
              Remover
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
