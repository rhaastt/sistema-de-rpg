import { notFound } from 'next/navigation';
import { Button } from '@/shared/ui';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getInviteById } from '@/features/invitations/repositories/invitation.repository';
import { acceptInviteAction, declineInviteAction } from '@/features/invitations/actions/invitation.actions';

export default async function InvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAuthUser();
  const supabase = await createClient();

  const invite = await getInviteById(supabase, id);
  if (!invite || invite.inviteeId !== user.id) notFound();

  if (invite.status !== 'pending') {
    const statusLabel: Record<string, string> = {
      accepted: 'já foi aceito',
      declined: 'foi recusado',
      cancelled: 'foi cancelado',
    };
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-body text-content-secondary">
            Este convite para <strong className="text-content">{invite.campaignName}</strong>{' '}
            {statusLabel[invite.status] ?? 'não está mais disponível'}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="font-serif text-section font-bold text-content">Convite de campanha</h1>
          <p className="mt-2 text-body text-content-secondary">
            <strong className="text-content">{invite.inviterName}</strong> convidou você para participar de{' '}
            <strong className="text-content">{invite.campaignName}</strong>.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <form action={acceptInviteAction.bind(null, id)}>
            <Button type="submit">Aceitar</Button>
          </form>
          <form action={declineInviteAction.bind(null, id)}>
            <Button type="submit" variant="secondary">
              Recusar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
