import Link from 'next/link';
import { registerAction } from '@/features/auth/actions/auth.actions';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Celestia RPG</h1>
          <p className="mt-1 text-sm text-gray-500">Crie sua conta</p>
        </div>

        <form action={registerAction} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Nome de exibição</label>
            <input id="displayName" name="displayName" type="text" required minLength={2} maxLength={60}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
            <p className="mt-1 text-xs text-gray-400">Mínimo 8 caracteres</p>
          </div>
          <button type="submit"
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Criar conta
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-indigo-600 hover:underline">Entre aqui</Link>
        </p>
      </div>
    </div>
  );
}
