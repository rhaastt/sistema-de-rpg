import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/shared/auth/session';
import { logoutAction } from '@/features/auth/actions/auth.actions';
import { Button } from '@/shared/ui';

export default async function CampaignsLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen">
      <nav className="border-b-2 border-stroke-subtle bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/campaigns" className="font-serif text-card-title font-bold text-content">
            Celestia RPG
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" size="small">
              Sair
            </Button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
