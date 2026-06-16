import Link from 'next/link';
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
          <h1 className="text-2xl font-bold">Celestia RPG</h1>
          <p className="mt-1 text-sm text-gray-500">Entre na sua conta</p>
        </div>

        {registered && (
          <p className="rounded bg-green-50 p-3 text-sm text-green-700">
            Conta criada com sucesso! Faça login para continuar.
          </p>
        )}
        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input id="password" name="password" type="password" required autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <button type="submit"
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Não tem conta?{' '}
          <Link href="/auth/register" className="text-indigo-600 hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
