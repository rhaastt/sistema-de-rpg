# Spec — Design System (Celestia)

Padrão visual único para toda a interface do Celestia. O objetivo é que qualquer
tela — autenticação, campanhas, fichas, convites — pareça o **mesmo produto**:
mesma paleta, mesma tipografia, mesmos componentes.

> Estado: tokens e componentes centrais prontos em `src/shared/ui/` e
> `src/app/globals.css`. A vitrine viva está em [`/design-system`](../../src/app/design-system/page.tsx).
> Toda UI nova consome os tokens/componentes deste documento; nada de paleta
> crua do Tailwind (§3).

---

## 1. Princípios

- **Tokens semânticos, não cores cruas.** A UI fala em `bg-surface`,
  `text-content`, `border-stroke-subtle` — nunca em `bg-white`, `text-gray-700`,
  `bg-indigo-600`. O significado (superfície, conteúdo, traço) sobrevive a uma
  troca de paleta; o hex não.
- **Paleta terrosa e monocromática.** A diferença entre estados é de **ênfase**,
  não de matiz (ver `StatusBadge`). Não há verde de "sucesso" nem vermelho de
  "erro" na interface — usa-se contraste e peso. Vida e mana são as únicas cores
  de destaque, e só em barras de recurso.
- **Dois tipos de fonte com papéis fixos.** Georgia (serif) para títulos; Inter
  (sans) para interface. Títulos são sempre `font-serif`.
- **Composição sobre duplicação.** Precisou de um botão? Use `<Button>`. Um
  campo? `<Input>`. Não recrie o visual à mão; se falta uma variante, estenda o
  componente em `src/shared/ui/`.
- **O `/design-system` é a fonte de verdade visual.** Componente novo ou variante
  nova entra na vitrine para revisão de olho.

## 2. Onde mora o quê

| Camada | Local | Papel |
|---|---|---|
| Tokens | [`src/app/globals.css`](../../src/app/globals.css) | Cores, tipografia, radius, bordas (via `@theme` do Tailwind v4) |
| Componentes | [`src/shared/ui/`](../../src/shared/ui/) | Botão, campo, card, painel, etc. Barril em `@/shared/ui` |
| Vitrine | [`src/app/design-system/page.tsx`](../../src/app/design-system/page.tsx) | Demonstra tokens e componentes vivos |

Import sempre pelo barril: `import { Button, Input, Card } from '@/shared/ui'`.

## 3. Regra de ouro — nada de paleta crua

**Proibido** em qualquer arquivo de UI (`src/app/**`, `src/features/**/components/**`):

- Cores nomeadas do Tailwind: `gray-*`, `indigo-*`, `green-*`, `red-*`,
  `yellow-*`, `blue-*`, `white`/`black` literais, etc.
- Escala de raio crua quando há token: `rounded-md`/`lg`/`sm` →
  `rounded-control`/`card`/`panel`/`default`.
- Escala de texto crua: `text-sm`/`base`/`lg`/`xl`/`2xl` → tokens de tipografia
  (`text-body`, `text-section`, `text-page`, …).
- `shadow-*` — o tema não usa sombra; profundidade vem de borda.

Varredura rápida (deve voltar vazia, ignorada a vitrine):

```bash
rg -n "(gray|indigo|green|red|yellow|blue|slate|zinc)-(50|100|200|300|400|500|600|700|800|900)|rounded-(md|lg|sm)\b|text-(xs|sm|base|lg|xl|2xl|3xl)\b|shadow-" src --glob '!src/app/design-system/**'
```

## 4. Tokens

### 4.1 Cores (semânticas → utility)

| Token | Utility | Uso |
|---|---|---|
| `--color-page` | `bg-page` | Fundo da página |
| `--color-surface` | `bg-surface` | Card, painel, nav |
| `--color-input` | `bg-input` | Fundo de campos |
| `--color-selected` | `bg-selected` | Item selecionado |
| `--color-content` | `text-content` | Texto primário / fundo de botão primário |
| `--color-content-secondary` | `text-content-secondary` | Texto secundário, metadados |
| `--color-content-inverse` | `text-content-inverse` | Texto sobre fundo escuro |
| `--color-stroke` | `border-stroke` | Borda padrão (botão secundário, ênfase) |
| `--color-stroke-subtle` | `border-stroke-subtle` | Borda de cards/campos/divisórias |
| `--color-stroke-active` | `border-stroke-active` | Foco e seleção |
| `--color-accent` | `bg-accent` / `text-accent` | Destaques discretos |
| `--color-life` / `--color-mana` | `bg-life` / `bg-mana` | **Só** barras de recurso |

### 4.2 Tipografia

Títulos em Georgia (`font-serif`, sempre bold): `text-display` (34), `text-page`
(26), `text-section` (21), `text-card-title` (19).
Interface em Inter: `text-body-lg` (17), `text-body` (15), `text-small` (13),
`text-label` (12, em geral `uppercase tracking-wide` para rótulos).

### 4.3 Radius

`rounded-small` (3 · checkbox) · `rounded-control` (6 · campos e botões) ·
`rounded-default` (8 · imagens) · `rounded-card` (10) · `rounded-panel` (12) ·
`rounded-full` (avatares, badges, indicadores).

### 4.4 Bordas

O tema é "de traço": profundidade vem de borda, não de sombra. `2px`
(`border-2`) é o padrão de cards/botões/campos/painéis; `3px` para aba/seleção
ativa; `1px` para divisórias internas; `5px` para barras de vida/mana.

## 5. Componentes disponíveis

| Componente | Para quê |
|---|---|
| `Button` | Ações. `variant="primary"` (fundo escuro) / `"secondary"` (contorno); `size="small"` |
| `Input` / `SearchInput` | Campos de texto, com `label`/`hint`/`error`/`leading` |
| `ImageUploadField` | Upload de imagem (.webp) — ver [`image-uploads.md`](./image-uploads.md) |
| `Card` / `CampaignCard` / `CharacterCard` | Superfícies e composições de lista |
| `SelectableCard` | Casco de card selecionável (raça, origem) |
| `Panel` / `DetailRow` | Painel de detalhes com cabeçalho e linhas rótulo/valor |
| `Frame` | Moldura "pergaminho" com cabeçalho — base das telas |
| `Badge` | Etiqueta discreta (status, papel, classe) |
| `Tabs` | Abas com borda inferior ativa |
| `Stepper` | Passos do fluxo de criação de personagem |
| `Avatar` | Avatar circular com fallback de iniciais |
| `ResourceBar` | Barras de vida/mana |
| `SidebarItem` | Item de navegação lateral |

### 5.1 Formulários

- Use `<Input>` para todo campo de texto/número — ele já entrega label, hint,
  erro e estados de foco corretos.
- **Não há componente de `textarea`** ainda. Enquanto não houver, use a classe
  canônica (idêntica ao `<Input>`, sem altura fixa):

  ```
  w-full rounded-control border-2 border-stroke-subtle bg-input px-4 py-3
  text-body text-content placeholder:text-content-secondary/70
  focus:border-stroke-active focus:outline-none
  ```

  Referência: [`CampaignForm`](../../src/features/campaigns/components/CampaignForm.tsx),
  [`edit narrativa`](../../src/app/campaigns/[id]/characters/[characterId]/edit/page.tsx).
- **`<select>`** segue o mesmo molde com altura de campo (`h-[50px]`); ver
  `CharacterCreationWizard` (`selectClass`).
- Mensagem de erro/estado de formulário: caixa neutra, sem vermelho —
  `rounded-control border-2 border-stroke bg-page p-3 text-small text-content`.

### 5.2 Estados (sem cor semântica)

Status de campanha/personagem usam **monocromia + peso**, não matiz: ativo em
`text-content`, inativo em `text-content-secondary`/`opacity`. Use `Badge` ou
`StatusBadge`. Nunca `bg-green-100`/`bg-red-100`.

## 6. Conformidade atual

Padronizados para o design system: todo `src/shared/ui/`; campanhas
(`StatusBadge`, `CampaignForm`, `CampaignsBrowser`, `MemberList`, `InviteForm`,
`HistoryLog`, `CampaignIllustration`); personagens (`CharacterCreationWizard`,
`CharacterSheet`, `AttributesForm`, `RaceCard`, `OriginCard`, `CardImage`); e as
páginas de autenticação, convites, layout de campanhas e visão/edição de
personagem.

Removidos por duplicação/abandono: `features/campaigns/CampaignCard` (duplicava
o `CampaignCard` de `shared/ui`) e `features/characters/CharacterForm`
(substituído pelo `CharacterCreationWizard`).

## 7. Checklist — nova tela ou componente

1. Reusa os componentes de `@/shared/ui`? Se faltou um, estenda lá (não recrie à mão).
2. Só usa tokens semânticos? Rode a varredura da §3 — deve voltar vazia.
3. Títulos em `font-serif`; tamanhos de texto via tokens de tipografia.
4. Estados em monocromia (sem verde/vermelho de status).
5. Profundidade por borda (`border-2` + tokens de stroke), nunca `shadow`.
6. Componente/variante novo entrou na vitrine [`/design-system`](../../src/app/design-system/page.tsx).

## 8. Em aberto / futuro

- **Componente `<Textarea>`** e **`<Select>`** dedicados, hoje resolvidos por
  classe canônica (§5.1).
- **Lint que barre paleta crua** (regra `no-restricted-syntax`/Tailwind) para
  automatizar a §3 — hoje é convenção + varredura manual.
- **Modo escuro** — os tokens já são semânticos; faltaria um segundo conjunto de
  valores.

Relacionado: [`image-uploads.md`](./image-uploads.md).
