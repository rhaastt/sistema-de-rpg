'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  lockCharacterSheetAction,
  unlockCharacterSheetAction,
  changeCharacterStatusAction,
  setCharacterHpAction,
} from '@/features/characters/actions/character.actions';
import { Avatar, Badge, Button, ResourceBar } from '@/shared/ui';
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
    <div className="flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="flex items-start gap-4">
        <Avatar src={character.imageUrl} name={character.name} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-page font-bold text-content">{character.name}</h1>
            <Badge>{STATUS_LABEL[character.status]}</Badge>
            {character.sheetLocked && <Badge>Ficha bloqueada</Badge>}
          </div>
          <p className="mt-1 text-small text-content-secondary">
            {character.raceName} · {SEX_LABEL[character.sex]}
            {character.age ? ` · ${character.age} anos` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {character.classes.map((cc) => (
              <Badge key={cc.slot}>
                {cc.className} — {cc.specializationName}
              </Badge>
            ))}
          </div>
        </div>

        {/* Controles do mestre */}
        {isMaster && (
          <div className="flex gap-2">
            <Button variant="secondary" size="small" onClick={toggleLock} disabled={isPending}>
              {character.sheetLocked ? 'Desbloquear ficha' : 'Bloquear ficha'}
            </Button>
            <Button variant="secondary" size="small" onClick={toggleStatus} disabled={isPending}>
              {character.status === 'active' ? 'Marcar como morto' : 'Marcar como ativo'}
            </Button>
          </div>
        )}
      </div>

      {/* Descrição visual (pública) */}
      {character.visualDescription && (
        <Section title="Descrição visual">
          <p className="whitespace-pre-wrap text-body text-content">{character.visualDescription}</p>
        </Section>
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
        <Section title="Atributos">
          <AttributesForm
            characterId={character.id}
            campaignId={character.campaignId}
            attributes={character.attributes}
            canEdit={canEdit}
          />
        </Section>
      )}

      {/* Background (privado) */}
      {(isMaster || isOwner) && character.background && (
        <Section title="Background">
          <p className="whitespace-pre-wrap text-body text-content">{character.background}</p>
        </Section>
      )}

      {canEdit && (
        <div>
          <Link href={`/campaigns/${character.campaignId}/characters/${character.id}/edit`}>
            <Button>Editar narrativa</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-label font-semibold uppercase tracking-wide text-content-secondary">{title}</h2>
      {children}
    </section>
  );
}
