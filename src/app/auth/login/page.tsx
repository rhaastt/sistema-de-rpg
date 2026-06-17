import Link from 'next/link';
import { Button, Input } from '@/shared/ui';
import { loginAction } from '@/features/auth/actions/auth.actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const { registered, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-page font-bold text-content">Celestia RPG</h1>
          <p className="mt-1 text-small text-content-secondary">Entre na sua conta</p>
        </div>

        {registered && (
          <p className="rounded-control border-2 border-stroke-subtle bg-surface p-3 text-small text-content">
            Conta criada com sucesso! Faça login para continuar.
          </p>
        )}
        {error && (
          <p className="rounded-control border-2 border-stroke bg-page p-3 text-small text-content">{error}</p>
        )}

        <form action={loginAction} className="space-y-4">
          <Input id="email" name="email" type="email" label="E-mail" required autoComplete="email" />
          <Input
            id="password"
            name="password"
            type="password"
            label="Senha"
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-center text-small text-content-secondary">
          Não tem conta?{' '}
          <Link href="/auth/register" className="font-medium text-content underline hover:no-underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
