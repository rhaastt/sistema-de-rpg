import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/shared/auth/session';
import { logoutAction } from '@/features/auth/actions/auth.actions';

export default async function CampaignsLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/campaigns" className="font-bold text-indigo-600">Celestia RPG</Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">Sair</button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
