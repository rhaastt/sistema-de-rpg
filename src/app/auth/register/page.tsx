import Link from 'next/link';
import { Button, Input } from '@/shared/ui';
import { registerAction } from '@/features/auth/actions/auth.actions';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-page font-bold text-content">Celestia RPG</h1>
          <p className="mt-1 text-small text-content-secondary">Crie sua conta</p>
        </div>

        {error && (
          <p className="rounded-control border-2 border-stroke bg-page p-3 text-small text-content">{error}</p>
        )}

        <form action={registerAction} className="space-y-4">
          <Input
            id="displayName"
            name="displayName"
            type="text"
            label="Nome de exibição"
            required
            minLength={2}
            maxLength={60}
          />
          <Input id="email" name="email" type="email" label="E-mail" required autoComplete="email" />
          <Input
            id="password"
            name="password"
            type="password"
            label="Senha"
            hint="Mínimo 8 caracteres"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full">
            Criar conta
          </Button>
        </form>

        <p className="text-center text-small text-content-secondary">
          Já tem conta?{' '}
          <Link href="/auth/login" className="font-medium text-content underline hover:no-underline">
            Entre aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
