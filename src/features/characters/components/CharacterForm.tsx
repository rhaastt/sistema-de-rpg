'use client';

import { useState } from 'react';
import { createCharacterAndRedirect } from '@/features/characters/actions/character.actions';
import type { Race, RulesetClass, Specialization } from '@/domain/ruleset/types';

interface Props {
  campaignId: string;
  races: Race[];
  classes: RulesetClass[];
  specializations: Specialization[];
}

const WITCH_RACE_NAME = 'Bruxa';

export function CharacterForm({ campaignId, races, classes, specializations }: Props) {
  const [sex, setSex] = useState('');
  const [raceId, setRaceId] = useState('');
  const [slot1ClassId, setSlot1ClassId] = useState('');
  const [slot2ClassId, setSlot2ClassId] = useState('');

  const specsByClass = (classId: string) =>
    specializations.filter((s) => s.classId === classId);

  const bruxaRace = races.find((r) => r.name === WITCH_RACE_NAME);

  function isWitchAllowed() {
    return sex === 'female' && raceId === bruxaRace?.id;
  }

  function filteredClasses(otherSlotClassId: string) {
    return classes.filter((c) => {
      if (c.name === 'Bruxa' && !isWitchAllowed()) return false;
      return c.id !== otherSlotClassId;
    });
  }

  return (
    <form action={createCharacterAndRedirect} className="space-y-6">
      <input type="hidden" name="campaignId" value={campaignId} />

      {/* Informações básicas */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Informações básicas</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome *</label>
          <input name="name" required maxLength={120}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sexo *</label>
            <select name="sex" required value={sex} onChange={(e) => setSex(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none">
              <option value="">Selecione</option>
              <option value="female">Feminino</option>
              <option value="male">Masculino</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Idade</label>
            <input name="age" type="number" min={1} max={9999}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Raça *</label>
          <select name="raceId" required value={raceId} onChange={(e) => setRaceId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none">
            <option value="">Selecione</option>
            {races.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Classe 1 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Classe 1</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Classe *</label>
            <select name="slot1ClassId" required value={slot1ClassId} onChange={(e) => setSlot1ClassId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none">
              <option value="">Selecione</option>
              {filteredClasses(slot2ClassId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Especialização *</label>
            <select name="slot1SpecializationId" required disabled={!slot1ClassId}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-60">
              <option value="">Selecione</option>
              {specsByClass(slot1ClassId).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Classe 2 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Classe 2</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Classe *</label>
            <select name="slot2ClassId" required value={slot2ClassId} onChange={(e) => setSlot2ClassId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none">
              <option value="">Selecione</option>
              {filteredClasses(slot1ClassId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Especialização *</label>
            <select name="slot2SpecializationId" required disabled={!slot2ClassId}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-60">
              <option value="">Selecione</option>
              {specsByClass(slot2ClassId).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Narrativa */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Narrativa</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição visual</label>
          <textarea name="visualDescription" rows={3} maxLength={1000}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Background</label>
          <textarea name="background" rows={5} maxLength={3000}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none" />
        </div>
      </section>

      <button type="submit"
        className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Criar personagem
      </button>
    </form>
  );
}
