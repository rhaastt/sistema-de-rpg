import Link from 'next/link';
import { requireAuthUser } from '@/shared/auth/session';
import { createClient } from '@/infrastructure/supabase/server';
import {
  getCampaignsForUser,
  getActiveMemberCounts,
} from '@/features/campaigns/repositories/campaign.repository';
import { getPendingInvitesForUser } from '@/features/invitations/repositories/invitation.repository';
import { CampaignsBrowser } from '@/features/campaigns/components/CampaignsBrowser';

export default async function CampaignsPage() {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const [campaigns, pendingInvites] = await Promise.all([
    getCampaignsForUser(supabase, user.id),
    getPendingInvitesForUser(supabase, user.id),
  ]);

  const memberCounts = await getActiveMemberCounts(
    supabase,
    campaigns.map((c) => c.id),
  );

  return (
    <div className="space-y-6">
      {pendingInvites.length > 0 && (
        <div className="rounded-panel border-2 border-stroke-subtle bg-surface px-6 py-4">
          <h2 className="mb-3 text-label font-semibold uppercase tracking-wide text-content-secondary">
            Convites pendentes
          </h2>
          <ul className="flex flex-col gap-2">
            {pendingInvites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3">
                <span className="text-body text-content">
                  <strong className="font-semibold">{inv.inviterName}</strong> convidou você para{' '}
                  <strong className="font-semibold">{inv.campaignName}</strong>
                </span>
                <Link
                  href={`/invitations/${inv.id}`}
                  className="shrink-0 rounded-control border-2 border-stroke px-3 py-1.5 text-small text-content hover:bg-selected/40"
                >
                  Ver convite
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CampaignsBrowser campaigns={campaigns} memberCounts={memberCounts} />
    </div>
  );
}
