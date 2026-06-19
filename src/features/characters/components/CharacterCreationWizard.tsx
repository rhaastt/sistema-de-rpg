'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { Button, Frame, Input, Stepper, cn } from '@/shared/ui';
import { createCharacterAction } from '@/features/characters/actions/character.actions';
import { REGIONS } from '@/domain/ruleset/types';
import type { Race, RulesetClass, Specialization, Skill, AttributeModifiers, AttributeKey } from '@/domain/ruleset/types';
import { ATTR_KEYS, ATTR_LABELS } from './attributes';
import { OriginCard } from './OriginCard';
import { RaceCard } from './RaceCard';

interface Props {
  campaignId: string;
  races: Race[];
  classes: RulesetClass[];
  specializations: Specialization[];
  skills: Skill[];
}

const STEPS = [
  { id: 'region', label: 'Região' },
  { id: 'identity', label: 'Identidade' },
  { id: 'race', label: 'Raça' },
  { id: 'classes', label: 'Classes' },
  { id: 'attributes', label: 'Atributos' },
  { id: 'skills', label: 'Perícias' },
  { id: 'review', label: 'Revisão' },
];

const TITLES = ['Região', 'Identidade', 'Raça', 'Classes e especializações', 'Atributos', 'Perícias', 'Revisão'];
const OBJECTIVES = [
  'Escolha o reino de origem do personagem.',
  'Quem é o personagem.',
  'Escolha a raça do personagem.',
  'No nível 1, escolha uma ou duas categorias de classe, cada uma com sua especialização. A segunda é opcional.',
  'Distribua o pool de pontos da raça. Valor final = distribuído + bônus racial.',
  'Escolha as perícias (cada uma exige um valor mínimo de atributo).',
  'Confira e confirme.',
];

const REGION_DESC: Record<string, string> = {
  Altária: 'Reino que abriga a região montanhosa de Galalad.',
  Kattawood: 'Terra dos Anumanos, os meio humano/animal.',
  Leondor: 'Reino de Leondor.',
  Barioth: 'Reino de Barioth.',
};

const SEX_OPTIONS = [
  { value: 'female', label: 'Feminino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Outro' },
];

const selectClass =
  'h-[50px] w-full rounded-control border-2 border-stroke-subtle bg-input px-3 text-body text-content focus:border-stroke-active focus:outline-none disabled:opacity-50';

type Slot = { classId: string; specializationId: string };
type Distribution = Record<AttributeKey, number>;

const ZERO_DIST: Distribution = {
  strength: 0,
  dexterity: 0,
  constitution: 0,
  intelligence: 0,
  mind: 0,
  charisma: 0,
};

export function CharacterCreationWizard({ campaignId, races, classes, specializations, skills }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState('');
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [raceId, setRaceId] = useState('');
  const [slot1, setSlot1] = useState<Slot>({ classId: '', specializationId: '' });
  const [slot2, setSlot2] = useState<Slot>({ classId: '', specializationId: '' });
  const [dist, setDist] = useState<Distribution>(ZERO_DIST);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bruxaClass = useMemo(() => classes.find((c) => c.name === 'Bruxa'), [classes]);
  const selectedRace = races.find((r) => r.id === raceId);
  const bruxaRace = useMemo(() => races.find((r) => r.name === 'Bruxa'), [races]);
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

  const pool = selectedRace?.attributePoints ?? 0;
  const modifiers: AttributeModifiers = selectedRace?.attributeModifiers ?? {};
  const distSum = ATTR_KEYS.reduce((sum, k) => sum + dist[k], 0);
  const remaining = pool - distSum;
  const finalOf = (k: AttributeKey) => dist[k] + (modifiers[k] ?? 0);

  const skillLimit = selectedRace?.name === 'Humano' ? 3 : 2;
  const isSkillAvailable = (s: Skill) =>
    s.attribute === null || finalOf(s.attribute) >= (s.requirementValue ?? 0);
  const availableCount = skills.filter(isSkillAvailable).length;
  const requiredSkills = Math.min(skillLimit, availableCount);

  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? '';
  const specName = (id: string) => specializations.find((s) => s.id === id)?.name ?? '';

  function validate(s: number): string | null {
    if (s === 0 && !region) return 'Escolha o reino de origem.';
    if (s === 1) {
      if (!name.trim()) return 'Informe o nome do personagem.';
      if (!sex) return 'Selecione o sexo.';
    }
    if (s === 2 && !raceId) return 'Selecione uma raça.';
    if (s === 3) {
      if (!slot1.classId || !slot1.specializationId) return 'Complete a classe e a especialização do slot 1.';
      // Slot 2 é opcional; se a classe foi escolhida, a especialização passa a ser exigida.
      if (slot2.classId && !slot2.specializationId) return 'Escolha a especialização do slot 2 ou deixe-o vazio.';
      const usesBruxa = bruxaClass && (slot1.classId === bruxaClass.id || slot2.classId === bruxaClass.id);
      if (usesBruxa && !bruxaAllowed) {
        return 'A classe Bruxa só pode ser escolhida por personagem da raça Bruxa e do sexo feminino.';
      }
    }
    if (s === 4 && remaining !== 0) {
      return remaining > 0
        ? `Distribua todos os pontos (faltam ${remaining}).`
        : `Você ultrapassou o pool em ${-remaining}.`;
    }
    if (s === 5 && skillIds.length !== requiredSkills) {
      return `Escolha ${requiredSkills} perícia(s).`;
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

  function adjust(k: AttributeKey, delta: number) {
    setDist((d) => {
      const value = d[k] + delta;
      if (value < 0) return d;
      if (delta > 0 && remaining <= 0) return d;
      return { ...d, [k]: value };
    });
  }

  function toggleSkill(id: string, available: boolean) {
    if (!available) return;
    setSkillIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= skillLimit) return ids;
      return [...ids, id];
    });
  }

  async function submit() {
    for (const s of [0, 1, 2, 3, 4, 5]) {
      const e = validate(s);
      if (e) {
        setError(e);
        setStep(s);
        return;
      }
    }
    setSubmitting(true);
    setError(null);

    const attributes = ATTR_KEYS.reduce<Record<string, number>>((o, k) => {
      o[k] = finalOf(k);
      return o;
    }, {});

    const fd = new FormData();
    fd.set('campaignId', campaignId);
    fd.set('name', name.trim());
    fd.set('sex', sex);
    fd.set('raceId', raceId);
    fd.set('region', region);
    fd.set('slot1ClassId', slot1.classId);
    fd.set('slot1SpecializationId', slot1.specializationId);
    fd.set('slot2ClassId', slot2.classId);
    fd.set('slot2SpecializationId', slot2.specializationId);
    fd.set('attributes', JSON.stringify(attributes));
    fd.set('skillIds', JSON.stringify(skillIds));

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REGIONS.map((r) => (
            <OriginCard
              key={r}
              name={r}
              description={REGION_DESC[r] ?? null}
              selected={r === region}
              onSelect={() => setRegion(r)}
            />
          ))}
        </div>
      )}

      {step === 1 && (
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

      {step === 2 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {races.map((r) => (
            <RaceCard key={r.id} race={r} selected={r.id === raceId} onSelect={() => setRaceId(r.id)} />
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {([1, 2] as const).map((which) => {
              const slot = which === 1 ? slot1 : slot2;
              const setSlot = which === 1 ? setSlot1 : setSlot2;
              const specs = slot.classId ? specsByClass.get(slot.classId) ?? [] : [];
              return (
                <div key={which} className="rounded-card border-2 border-stroke-subtle bg-page p-4">
                  <p className="mb-3 text-label font-semibold uppercase tracking-wide text-content-secondary">
                    Slot {which}
                    {which === 2 ? ' (opcional)' : ''}
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label font-medium text-content">Classe</label>
                      <select
                        value={slot.classId}
                        onChange={(e) => setSlot({ classId: e.target.value, specializationId: '' })}
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
                        onChange={(e) => setSlot({ ...slot, specializationId: e.target.value })}
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

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <span className="text-body text-content">Pool da raça {selectedRace ? `(${selectedRace.name})` : ''}</span>
            <span className="text-body font-semibold tabular-nums text-content">
              Restam {remaining} / {pool}
            </span>
          </div>
          <div className="overflow-hidden rounded-card border-2 border-stroke-subtle">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-stroke-subtle bg-page px-4 py-2 text-label uppercase tracking-wide text-content-secondary">
              <span>Atributo</span>
              <span className="w-24 text-center">Distribuir</span>
              <span className="w-16 text-center">Bônus</span>
              <span className="w-14 text-right">Final</span>
            </div>
            {ATTR_KEYS.map((k) => {
              const mod = modifiers[k] ?? 0;
              return (
                <div
                  key={k}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 border-b border-stroke-subtle px-4 py-2 last:border-b-0"
                >
                  <span className="text-body text-content">{ATTR_LABELS[k]}</span>
                  <span className="flex w-24 items-center justify-center gap-2">
                    <StepBtn onClick={() => adjust(k, -1)} disabled={dist[k] <= 0} label="menos">−</StepBtn>
                    <span className="w-5 text-center tabular-nums text-content">{dist[k]}</span>
                    <StepBtn onClick={() => adjust(k, 1)} disabled={remaining <= 0} label="mais">+</StepBtn>
                  </span>
                  <span className="w-16 text-center text-small tabular-nums text-content-secondary">
                    {mod > 0 ? `+${mod}` : mod}
                  </span>
                  <span className="w-14 text-right font-semibold tabular-nums text-content">{finalOf(k)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-small text-content-secondary">
            Perícias não aumentam atributos — apenas verificam requisitos.
          </p>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <span className="text-body text-content">Perícias</span>
            <span className="text-body font-semibold tabular-nums text-content">
              {skillIds.length} / {skillLimit}
            </span>
          </div>
          <ul className="overflow-hidden rounded-card border-2 border-stroke-subtle">
            {skills.map((s) => {
              const available = isSkillAvailable(s);
              const selected = skillIds.includes(s.id);
              const req = s.attribute ? `${ATTR_LABELS[s.attribute]} ${s.requirementValue}` : 'Sem requisito';
              const reachedLimit = skillIds.length >= skillLimit && !selected;
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 border-b border-stroke-subtle px-4 py-2.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-body text-content">{s.name}</p>
                    <p className="text-small text-content-secondary">{req}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSkill(s.id, available)}
                    disabled={!available || reachedLimit}
                    className={cn(
                      'shrink-0 rounded-control border-2 px-3 py-1.5 text-small transition-colors',
                      selected
                        ? 'border-stroke-active bg-content text-content-inverse'
                        : available && !reachedLimit
                          ? 'border-stroke text-content hover:bg-selected/40'
                          : 'border-stroke-subtle text-content-secondary opacity-60',
                    )}
                  >
                    {selected ? 'Escolhida' : available ? 'Escolher' : 'Indisponível'}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-small text-content-secondary">
            {selectedRace?.name === 'Humano'
              ? 'Humano escolhe 3 perícias.'
              : 'Personagens escolhem 2 perícias.'}{' '}
            Disponível = o atributo final atende ao requisito.
          </p>
        </div>
      )}

      {step === 6 && (
        <dl className="max-w-xl">
          <ReviewRow label="Região">{region || '—'}</ReviewRow>
          <ReviewRow label="Nome">{name || '—'}</ReviewRow>
          <ReviewRow label="Sexo">{SEX_OPTIONS.find((o) => o.value === sex)?.label ?? '—'}</ReviewRow>
          <ReviewRow label="Raça">{selectedRace?.name ?? '—'}</ReviewRow>
          <ReviewRow label="Classe 1">
            {slot1.classId ? `${className(slot1.classId)} · ${specName(slot1.specializationId)}` : '—'}
          </ReviewRow>
          <ReviewRow label="Classe 2">
            {slot2.classId ? `${className(slot2.classId)} · ${specName(slot2.specializationId)}` : '—'}
          </ReviewRow>
          <ReviewRow label="Atributos">
            {ATTR_KEYS.map((k) => `${ATTR_LABELS[k].slice(0, 3)} ${finalOf(k)}`).join(' · ')}
          </ReviewRow>
          <ReviewRow label="Perícias">
            {skillIds.length
              ? skills
                  .filter((s) => skillIds.includes(s.id))
                  .map((s) => s.name)
                  .join(', ')
              : '—'}
          </ReviewRow>
        </dl>
      )}

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

function StepBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'h-7 w-7 rounded-control border-2 border-stroke text-content transition-colors',
        disabled ? 'opacity-40' : 'hover:bg-selected/40',
      )}
    >
      {children}
    </button>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stroke-subtle py-3 last:border-b-0">
      <dt className="text-label uppercase tracking-wide text-content-secondary">{label}</dt>
      <dd className="text-right text-body text-content">{children}</dd>
    </div>
  );
}
