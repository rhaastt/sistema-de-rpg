'use client';

import { useTransition } from 'react';
import { Button, Input } from '@/shared/ui';
import { updateCharacterAttributesAction } from '@/features/characters/actions/character.actions';
import type { CharacterAttributes } from '@/domain/character/types';

const ATTRIBUTE_LABELS = {
  strength: 'Força',
  dexterity: 'Destreza',
  constitution: 'Constituição',
  intelligence: 'Inteligência',
  mind: 'Mente',
  charisma: 'Carisma',
} as const;

const ATTRS = ['strength', 'dexterity', 'constitution', 'intelligence', 'mind', 'charisma'] as const;

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ATTRS.map((attr) => (
          <Input
            key={attr}
            id={attr}
            name={attr}
            type="number"
            label={ATTRIBUTE_LABELS[attr]}
            defaultValue={attributes[attr]}
            disabled={!canEdit}
          />
        ))}
      </div>
      {canEdit && (
        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? 'Salvando...' : 'Salvar atributos'}
        </Button>
      )}
    </form>
  );
}
