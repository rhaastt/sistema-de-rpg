'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  lockCharacterSheetAction,
  unlockCharacterSheetAction,
  changeCharacterStatusAction,
  setCharacterHpAction,
} from '@/features/characters/actions/character.actions';
import { ResourceBar } from '@/shared/ui';
import { maxHp, carryCapacity } from '@/domain/character/vitals';
import { AttributesForm } from './AttributesForm';
import type { CharacterFullView } from '@/domain/character/types';

const SEX_LABEL = { female: 'Feminino', male: 'Masculino', other: 'Outro' };
const STATUS_LABEL = { active: 'Ativo', dead: 'Morto' };

interface Props {
  character: CharacterFullView;
  isMaster: boolean;
  isOwner: boolean;
}

export function CharacterSheet({ character, isMaster, isOwner }: Props) {
  const [isPending, startTransition] = useTransition();
  const canEdit = isMaster || (isOwner && !character.sheetLocked);

  // Vitais derivados (Compêndio §2). A vida atual inicia na máxima.
  const maxHpValue = maxHp(character.attributes.constitution);
  const currentHpValue = character.currentHp ?? maxHpValue;
  const carry = carryCapacity(character.attributes.strength);
  const [hpInput, setHpInput] = useState(String(currentHpValue));

  function saveHp() {
    startTransition(async () => {
      const result = await setCharacterHpAction(character.id, character.campaignId, Number(hpInput));
      if (!result.success) alert(result.error);
    });
  }

  function toggleLock() {
    startTransition(async () => {
      const action = character.sheetLocked ? unlockCharacterSheetAction : lockCharacterSheetAction;
      const result = await action(character.id, character.campaignId);
      if (!result.success) alert(result.error);
    });
  }

  function toggleStatus() {
    const next = character.status === 'active' ? 'dead' : 'active';
    startTransition(async () => {
      const result = await changeCharacterStatusAction(character.id, character.campaignId, next);
      if (!result.success) alert(result.error);
    });
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-start gap-4">
        {character.imageUrl && (
          <img src={character.imageUrl} alt={character.name}
            className="h-24 w-24 rounded-full object-cover border border-gray-200" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{character.name}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              character.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {STATUS_LABEL[character.status]}
            </span>
            {character.sheetLocked && (
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Ficha bloqueada
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {character.raceName} · {SEX_LABEL[character.sex]}{character.age ? ` · ${character.age} anos` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {character.classes.map((cc) => (
              <span key={cc.slot} className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                {cc.className} — {cc.specializationName}
              </span>
            ))}
          </div>
        </div>

        {/* Controles do mestre */}
        {isMaster && (
          <div className="flex gap-2">
            <button onClick={toggleLock} disabled={isPending}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-60">
              {character.sheetLocked ? 'Desbloquear ficha' : 'Bloquear ficha'}
            </button>
            <button onClick={toggleStatus} disabled={isPending}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-60">
              {character.status === 'active' ? 'Marcar como morto' : 'Marcar como ativo'}
            </button>
          </div>
        )}
      </div>

      {/* Descrição visual (pública) */}
      {character.visualDescription && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Descrição visual</h2>
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{character.visualDescription}</p>
        </section>
      )}

      {/* Vitais (privado: dono vê %, mestre vê absoluto e controla) */}
      {(isMaster || isOwner) && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Vitais</h2>
          <div className="mt-2 max-w-sm space-y-3 rounded-card border-2 border-stroke-subtle bg-surface p-4">
            {isMaster ? (
              <>
                <ResourceBar variant="life" value={currentHpValue} max={maxHpValue} />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxHpValue}
                    value={hpInput}
                    onChange={(e) => setHpInput(e.target.value)}
                    className="h-9 w-24 rounded-control border-2 border-stroke-subtle bg-input px-2 text-body text-content focus:border-stroke-active focus:outline-none"
                  />
                  <button
                    onClick={saveHp}
                    disabled={isPending}
                    className="rounded-control border-2 border-content bg-content px-3 py-1.5 text-small font-medium text-content-inverse hover:bg-content/90 disabled:opacity-60"
                  >
                    Salvar vida
                  </button>
                </div>
              </>
            ) : (
              <ResourceBar variant="life" value={currentHpValue} max={maxHpValue} display="percent" />
            )}
            <p className="text-small text-content-secondary">Capacidade de carga: {carry} kg</p>
          </div>
        </section>
      )}

      {/* Atributos (privado) */}
      {(isMaster || isOwner) && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Atributos</h2>
          <div className="mt-2">
            <AttributesForm
              characterId={character.id}
              campaignId={character.campaignId}
              attributes={character.attributes}
              canEdit={canEdit}
            />
          </div>
        </section>
      )}

      {/* Background (privado) */}
      {(isMaster || isOwner) && character.background && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Background</h2>
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{character.background}</p>
        </section>
      )}

      {canEdit && (
        <div>
          <Link
            href={`/campaigns/${character.campaignId}/characters/${character.id}/edit`}
            className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Editar narrativa
          </Link>
        </div>
      )}
    </div>
  );
}
