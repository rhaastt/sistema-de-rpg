'use client';

import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  CampaignCard,
  Card,
  CharacterCard,
  DetailRow,
  Input,
  Panel,
  ResourceBar,
  SearchInput,
  SidebarItem,
  Stepper,
  Tabs,
} from '@/shared/ui';

const colors = [
  ['background / page', 'bg-page'],
  ['surface / card', 'bg-surface'],
  ['selected', 'bg-selected'],
  ['accent', 'bg-accent'],
  ['content / primary', 'bg-content'],
  ['content / secondary', 'bg-content-secondary'],
  ['stroke / default', 'bg-stroke'],
  ['stroke / subtle', 'bg-stroke-subtle'],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-section">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [tab, setTab] = useState('overview');
  const [step, setStep] = useState(1);

  return (
    <main className="mx-auto max-w-5xl px-10 py-12">
      <header className="mb-12 flex flex-col gap-2">
        <span className="text-label uppercase tracking-wide text-content-secondary">
          Design System
        </span>
        <h1 className="text-display">Celestia</h1>
        <p className="text-body-lg text-content-secondary">
          Tokens e componentes centrais do tema. Georgia para títulos, Inter para interface.
        </p>
      </header>

      <div className="flex flex-col gap-14">
        <Section title="Cores">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {colors.map(([label, cls]) => (
              <div key={label} className="flex flex-col gap-2">
                <div className={`h-16 rounded-default border-2 border-stroke-subtle ${cls}`} />
                <span className="text-small text-content-secondary">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tipografia">
          <Card className="flex flex-col gap-3">
            <p className="font-serif text-display font-bold">Display · 34px</p>
            <p className="font-serif text-page font-bold">Página · 26px</p>
            <p className="font-serif text-section font-bold">Seção · 21px</p>
            <p className="font-serif text-card-title font-bold">Card · 19px</p>
            <hr className="border-stroke-subtle" />
            <p className="text-body-lg">Body large · 17px — Inter</p>
            <p className="text-body">Body default · 15px — Inter</p>
            <p className="text-small text-content-secondary">Body small · 13px — metadados</p>
            <p className="text-label uppercase tracking-wide text-content-secondary">Label · 12px</p>
          </Card>
        </Section>

        <Section title="Botões">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Criar campanha</Button>
            <Button variant="secondary">Cancelar</Button>
            <Button variant="primary" size="small">
              Pequeno
            </Button>
            <Button variant="primary" disabled>
              Salvando...
            </Button>
          </div>
        </Section>

        <Section title="Campos">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input id="ds-name" label="Nome da campanha" placeholder="Crônicas de Celestia" />
            <Input id="ds-age" label="Idade" hint="Opcional" placeholder="32" />
            <SearchInput id="ds-search" />
            <Input id="ds-err" label="E-mail" error="Usuário não encontrado" defaultValue="x@y" />
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-5 sm:grid-cols-2">
            <CampaignCard
              name="A Queda de Eldrath"
              description="Uma jornada pelas ruínas do antigo império celeste."
              status="Em andamento"
              role="master"
            />
            <CampaignCard name="Sussurros do Abismo" status="Em preparação" role="player" />
            <CharacterCard
              name="Morgana Vey"
              raceName="Bruxa"
              className_="Bruxa · Mago"
              avatar={<Avatar name="Morgana Vey" />}
            />
            <CharacterCard
              name="Thorin Pedra-Forte"
              raceName="Anão"
              className_="Guerreiro"
              avatar={<Avatar name="Thorin Pedra-Forte" />}
              dead
            />
          </div>
        </Section>

        <Section title="Painel de detalhes">
          <Panel title="Ficha" actions={<Button size="small" variant="secondary">Editar</Button>}>
            <DetailRow label="Raça">Humano</DetailRow>
            <DetailRow label="Classes">Guerreiro · Mago</DetailRow>
            <DetailRow label="Estado">Ativo</DetailRow>
          </Panel>
        </Section>

        <Section title="Navegação (sidebar)">
          <div className="w-[220px] rounded-panel border-2 border-stroke-subtle bg-surface p-2">
            <SidebarItem label="Campanhas" active icon={<Dot />} />
            <SidebarItem label="Personagens" icon={<Dot />} />
            <SidebarItem label="Convites" icon={<Dot />} />
          </div>
        </Section>

        <Section title="Abas">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'overview', label: 'Visão geral' },
              { id: 'members', label: 'Participantes' },
              { id: 'history', label: 'Histórico' },
            ]}
          >
            <p className="text-body text-content-secondary">Conteúdo da aba: {tab}</p>
          </Tabs>
        </Section>

        <Section title="Stepper">
          <Stepper
            current={step}
            steps={[
              { id: 'basic', label: 'Básico' },
              { id: 'class', label: 'Classes' },
              { id: 'attrs', label: 'Atributos' },
              { id: 'review', label: 'Revisão' },
            ]}
          />
          <div className="flex gap-3">
            <Button variant="secondary" size="small" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Voltar
            </Button>
            <Button size="small" onClick={() => setStep((s) => Math.min(3, s + 1))}>
              Avançar
            </Button>
          </div>
        </Section>

        <Section title="Avatares & barras de recurso">
          <div className="flex flex-wrap items-end gap-8">
            <div className="flex items-end gap-4">
              <Avatar name="Morgana Vey" size="sm" />
              <Avatar name="Morgana Vey" size="md" />
              <Avatar name="Morgana Vey" size="lg" />
            </div>
            <div className="flex w-64 flex-col gap-4">
              <ResourceBar variant="life" value={72} max={100} />
              <ResourceBar variant="mana" value={30} max={60} />
            </div>
          </div>
        </Section>

        <Section title="Etiquetas">
          <div className="flex gap-3">
            <Badge>Em andamento</Badge>
            <Badge>Arquivada</Badge>
            <Badge>Mestre</Badge>
          </div>
        </Section>
      </div>
    </main>
  );
}

function Dot() {
  return <span className="block h-2 w-2 rounded-full bg-current" />;
}
