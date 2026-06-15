'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { Button, Frame, Input, Stepper, cn } from '@/shared/ui';
import { createCharacterAction } from '@/features/characters/actions/character.actions';
import type { Race, RulesetClass, Specialization } from '@/domain/ruleset/types';

interface Props {
  campaignId: string;
  races: Race[];
  classes: RulesetClass[];
  specializations: Specialization[];
}

const STEPS = [
  { id: 'identity', label: 'Identidade' },
  { id: 'race', label: 'Raça' },
  { id: 'classes', label: 'Classes' },
  { id: 'review', label: 'Revisão' },
];

// Sexo é usado pela restrição da classe Bruxa (Compêndio §4/§5).
const SEX_OPTIONS = [
  { value: 'female', label: 'Feminino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Outro' },
];

const TITLES = ['Identidade', 'Raça', 'Classes e especializações', 'Revisão'];
const OBJECTIVES = [
  'Quem é o personagem.',
  'Escolha a raça do personagem.',
  'No nível 1, escolha duas categorias de classe, cada uma com sua especialização.',
  'Confira e confirme.',
];

const selectClass =
  'h-[50px] w-full rounded-control border-2 border-stroke-subtle bg-input px-3 text-body text-content focus:border-stroke-active focus:outline-none disabled:opacity-50';

type Slot = { classId: string; specializationId: string };

export function CharacterCreationWizard({ campaignId, races, classes, specializations }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [raceId, setRaceId] = useState('');
  const [slot1, setSlot1] = useState<Slot>({ classId: '', specializationId: '' });
  const [slot2, setSlot2] = useState<Slot>({ classId: '', specializationId: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bruxaRace = useMemo(() => races.find((r) => r.name === 'Bruxa'), [races]);
  const bruxaClass = useMemo(() => classes.find((c) => c.name === 'Bruxa'), [classes]);
  const bruxaAllowed = sex === 'female' && !!bruxaRace && raceId === bruxaRace.id;

  const specsByClass = useMemo(() => {
    const m = new Map<string, Specialization[]>();
    for (const s of specializations) {
      const list = m.get(s.classId) ?? [];
      list.push(s);
      m.set(s.classId, list);
    }
    return m;
  }, [specializations]);

  const selectedRace = races.find((r) => r.id === raceId);
  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? '';
  const specName = (id: string) => specializations.find((s) => s.id === id)?.name ?? '';

  function validate(s: number): string | null {
    if (s === 0) {
      if (!name.trim()) return 'Informe o nome do personagem.';
      if (!sex) return 'Selecione o sexo.';
    }
    if (s === 1 && !raceId) return 'Selecione uma raça.';
    if (s === 2) {
      if (!slot1.classId || !slot1.specializationId) return 'Complete a classe e a especialização do slot 1.';
      if (!slot2.classId || !slot2.specializationId) return 'Complete a classe e a especialização do slot 2.';
      const usesBruxa = bruxaClass && (slot1.classId === bruxaClass.id || slot2.classId === bruxaClass.id);
      if (usesBruxa && !bruxaAllowed) {
        return 'A classe Bruxa só pode ser escolhida por personagem da raça Bruxa e do sexo feminino.';
      }
    }
    return null;
  }

  function next() {
    const e = validate(step);
    if (e) return setError(e);
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function setSlot(which: 1 | 2, slot: Slot) {
    (which === 1 ? setSlot1 : setSlot2)(slot);
  }

  async function submit() {
    const e = validate(2);
    if (e) {
      setError(e);
      setStep(2);
      return;
    }
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set('campaignId', campaignId);
    fd.set('name', name.trim());
    fd.set('sex', sex);
    fd.set('raceId', raceId);
    fd.set('slot1ClassId', slot1.classId);
    fd.set('slot1SpecializationId', slot1.specializationId);
    fd.set('slot2ClassId', slot2.classId);
    fd.set('slot2SpecializationId', slot2.specializationId);

    const res = await createCharacterAction(fd);
    if (res.success && res.data) {
      router.push(`/campaigns/${campaignId}/characters/${res.data.id}` as Route);
    } else {
      setSubmitting(false);
      setError(res.success ? 'Falha ao criar personagem.' : res.error);
    }
  }

  return (
    <Frame title={TITLES[step]} subtitle={OBJECTIVES[step]}>
      <div className="mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      {error && (
        <p className="mb-5 rounded-control border-2 border-stroke bg-page p-3 text-small text-content">{error}</p>
      )}

      {step === 0 && (
        <div className="flex max-w-lg flex-col gap-5">
          <Input
            id="name"
            label="Nome do personagem"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            placeholder="Nome do personagem"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sex" className="text-label font-medium text-content">
              Sexo
            </label>
            <select id="sex" value={sex} onChange={(e) => setSex(e.target.value)} className={selectClass}>
              <option value="">Selecione...</option>
              {SEX_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {races.map((r) => {
            const active = r.id === raceId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRaceId(r.id)}
                className={cn(
                  'flex flex-col gap-1 rounded-card border-2 p-4 text-left transition-colors',
                  active ? 'border-stroke-active bg-selected/40' : 'border-stroke-subtle bg-page hover:border-stroke',
                )}
                aria-pressed={active}
              >
                <span className="font-serif text-card-title font-bold text-content">{r.name}</span>
                {r.description && <span className="text-small text-content-secondary">{r.description}</span>}
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {([1, 2] as const).map((which) => {
              const slot = which === 1 ? slot1 : slot2;
              const specs = slot.classId ? specsByClass.get(slot.classId) ?? [] : [];
              return (
                <div key={which} className="rounded-card border-2 border-stroke-subtle bg-page p-4">
                  <p className="mb-3 text-label font-semibold uppercase tracking-wide text-content-secondary">
                    Slot {which}
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label font-medium text-content">Classe</label>
                      <select
                        value={slot.classId}
                        onChange={(e) => setSlot(which, { classId: e.target.value, specializationId: '' })}
                        className={selectClass}
                      >
                        <option value="">Selecione...</option>
                        {classes.map((c) => {
                          const isBruxa = bruxaClass && c.id === bruxaClass.id;
                          return (
                            <option key={c.id} value={c.id} disabled={Boolean(isBruxa) && !bruxaAllowed}>
                              {c.name}
                              {isBruxa && !bruxaAllowed ? ' (requer raça Bruxa e sexo feminino)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label font-medium text-content">Especialização</label>
                      <select
                        value={slot.specializationId}
                        onChange={(e) => setSlot(which, { ...slot, specializationId: e.target.value })}
                        disabled={!slot.classId}
                        className={selectClass}
                      >
                        <option value="">{slot.classId ? 'Selecione...' : 'Escolha a classe primeiro'}</option>
                        {specs.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-small text-content-secondary">
            A classe Bruxa só pode ser escolhida por personagem da raça Bruxa e do sexo feminino.
          </p>
        </div>
      )}

      {step === 3 && (
        <dl className="max-w-xl">
          <ReviewRow label="Nome">{name || '—'}</ReviewRow>
          <ReviewRow label="Sexo">{SEX_OPTIONS.find((o) => o.value === sex)?.label ?? '—'}</ReviewRow>
          <ReviewRow label="Raça">{selectedRace?.name ?? '—'}</ReviewRow>
          <ReviewRow label="Classe 1">
            {slot1.classId ? `${className(slot1.classId)} · ${specName(slot1.specializationId)}` : '—'}
          </ReviewRow>
          <ReviewRow label="Classe 2">
            {slot2.classId ? `${className(slot2.classId)} · ${specName(slot2.specializationId)}` : '—'}
          </ReviewRow>
        </dl>
      )}

      {/* Rodapé de navegação */}
      <div className="mt-7 flex items-center justify-between border-t border-stroke-subtle pt-5">
        <Link href={`/campaigns/${campaignId}` as Route}>
          <Button variant="secondary" type="button">
            Cancelar
          </Button>
        </Link>
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" type="button" onClick={back} disabled={submitting}>
              Voltar
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Próximo
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar personagem'}
            </Button>
          )}
        </div>
      </div>
    </Frame>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stroke-subtle py-3 last:border-b-0">
      <dt className="text-label uppercase tracking-wide text-content-secondary">{label}</dt>
      <dd className="text-body text-content">{children}</dd>
    </div>
  );
}
