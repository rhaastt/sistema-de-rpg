import Link from 'next/link';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import { getCampaignsForUser } from '@/features/campaigns/repositories/campaign.repository';
import { CampaignCard } from '@/features/campaigns/components/CampaignCard';
import { getPendingInvitesForUser } from '@/features/invitations/repositories/invitation.repository';

export default async function CampaignsPage() {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const [campaigns, pendingInvites] = await Promise.all([
    getCampaignsForUser(supabase, user.id),
    getPendingInvitesForUser(supabase, user.id),
  ]);

  const active = campaigns.filter((c) => c.status !== 'archived');
  const archived = campaigns.filter((c) => c.status === 'archived');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Minhas campanhas</h1>
        <Link href="/campaigns/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Nova campanha
        </Link>
      </div>

      {pendingInvites.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Convites pendentes
          </h2>
          <ul className="space-y-2">
            {pendingInvites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <span className="text-sm text-gray-800">
                  <strong>{inv.inviterName}</strong> convidou você para <strong>{inv.campaignName}</strong>
                </span>
                <Link href={`/invitations/${inv.id}`}
                  className="rounded-md border border-yellow-400 px-3 py-1 text-sm text-yellow-800 hover:bg-yellow-100">
                  Ver convite
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {active.length === 0 && pendingInvites.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-12">
          Nenhuma campanha ainda. Crie uma ou aguarde um convite.
        </p>
      ) : (
        <section>
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      )}

      {archived.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Arquivadas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {archived.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
