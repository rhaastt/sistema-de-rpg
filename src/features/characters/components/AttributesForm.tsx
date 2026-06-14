'use client';

import { useTransition } from 'react';
import { updateCharacterAttributesAction } from '@/features/characters/actions/character.actions';
import type { CharacterAttributes } from '@/domain/character/types';

const ATTRIBUTE_LABELS: Record<keyof Omit<CharacterAttributes, 'id' | 'characterId' | 'updatedAt'>, string> = {
  strength: 'Força',
  dexterity: 'Destreza',
  constitution: 'Constituição',
  intelligence: 'Inteligência',
  mind: 'Mente',
  charisma: 'Carisma',
};

interface Props {
  characterId: string;
  campaignId: string;
  attributes: CharacterAttributes;
  canEdit: boolean;
}

export function AttributesForm({ characterId, campaignId, attributes, canEdit }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateCharacterAttributesAction(characterId, campaignId, formData);
      if (!result.success) alert(result.error);
    });
  }

  const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'mind', 'charisma'] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {attrs.map((attr) => (
          <div key={attr}>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
              {ATTRIBUTE_LABELS[attr]}
            </label>
            <input
              name={attr}
              type="number"
              defaultValue={attributes[attr]}
              disabled={!canEdit}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        ))}
      </div>
      {canEdit && (
        <button type="submit" disabled={isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {isPending ? 'Salvando...' : 'Salvar atributos'}
        </button>
      )}
    </form>
  );
}
