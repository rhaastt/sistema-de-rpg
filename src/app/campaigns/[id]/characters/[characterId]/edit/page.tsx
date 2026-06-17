'use client';

import { useActionState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input } from '@/shared/ui';
import { updateCharacterNarrativeAction } from '@/features/characters/actions/character.actions';
import type { ActionResult } from '@/shared/types/action-result';
import type { Character } from '@/domain/character/types';

const initialState: ActionResult<Character> = { success: true, data: undefined as unknown as Character };

const textareaClass =
  'w-full rounded-control border-2 border-stroke-subtle bg-input px-4 py-3 text-body text-content ' +
  'placeholder:text-content-secondary/70 focus:border-stroke-active focus:outline-none';

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
      <h1 className="font-serif text-section font-bold text-content">Editar narrativa</h1>

      {!state.success && (
        <p className="rounded-control border-2 border-stroke bg-page p-3 text-small text-content">{state.error}</p>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <Input id="name" name="name" type="text" label="Nome" maxLength={120} />
        <Input id="age" name="age" type="number" label="Idade" min={1} />
        <Input id="imageUrl" name="imageUrl" type="url" label="URL da imagem" />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="visualDescription" className="text-label font-medium text-content">
            Descrição visual
          </label>
          <textarea
            id="visualDescription"
            name="visualDescription"
            rows={3}
            maxLength={1000}
            className={textareaClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="background" className="text-label font-medium text-content">
            Background
          </label>
          <textarea id="background" name="background" rows={6} maxLength={3000} className={textareaClass} />
        </div>
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </div>
  );
}
