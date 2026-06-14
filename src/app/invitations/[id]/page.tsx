import { notFound } from 'next/navigation';
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
          <p className="text-gray-600">
            Este convite para <strong>{invite.campaignName}</strong> {statusLabel[invite.status] ?? 'não está mais disponível'}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-xl font-bold">Convite de campanha</h1>
          <p className="mt-2 text-sm text-gray-600">
            <strong>{invite.inviterName}</strong> convidou você para participar de{' '}
            <strong>{invite.campaignName}</strong>.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <form action={acceptInviteAction.bind(null, id)}>
            <button type="submit"
              className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Aceitar
            </button>
          </form>
          <form action={declineInviteAction.bind(null, id)}>
            <button type="submit"
              className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Recusar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
