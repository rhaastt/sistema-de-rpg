'use client';

import { useActionState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updateCharacterNarrativeAction } from '@/features/characters/actions/character.actions';
import type { ActionResult } from '@/shared/types/action-result';
import type { Character } from '@/domain/character/types';

const initialState: ActionResult<Character> = { success: true, data: undefined as unknown as Character };

export default function EditCharacterPage() {
  const params = useParams<{ id: string; characterId: string }>();
  const router = useRouter();
  const boundAction = updateCharacterNarrativeAction.bind(null, params.characterId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (state.success && state.data) {
    router.push(`/campaigns/${params.id}/characters/${params.characterId}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold">Editar narrativa</h1>

      {!state.success && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input name="name" type="text" maxLength={120}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Idade</label>
          <input name="age" type="number" min={1}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL da imagem</label>
          <input name="imageUrl" type="url"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição visual</label>
          <textarea name="visualDescription" rows={3} maxLength={1000}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Background</label>
          <textarea name="background" rows={6} maxLength={3000}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
