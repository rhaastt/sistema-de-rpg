# Spec — Fase 4: Expansões do ruleset

Plano de construção da Fase 4 (vida, perícias, atributos com pool, inventário,
XP/níveis, passivas e bônus raciais). **Fonte de verdade do conteúdo: o
[Compêndio Celestia](../../compendio-celestia).** Este documento NÃO redefine
regras — apenas organiza o que já está definido (a construir) e o que ainda é
decisão em aberto (precisa do mestre), com referência às seções do compêndio.

> Estado: Fases 1–3 concluídas. Fase 4 não iniciada e **gated** pelo `.claude`
> §14 ("somente depois de validar as fases anteriores"). A criação de personagem
> hoje cobre Identidade, Raça, Classes/Especializações e Revisão; Atributos,
> Perícias e Origem dependem desta fase.

---

## 1. Decisões pendentes (Compêndio §10)

Itens que **não podem ser implementados sem decisão** — não inventar, não
completar por convenção. Precisam ser fechados com o mestre.

### 1.1 Bloqueiam etapas da criação

| Decisão | Trava | Necessário para |
|---|---|---|
| **Teto por atributo** na criação (e na evolução) | Etapa **Atributos** | Validar a distribuição do pool |
| **Cidades de Leondor e Barioth** | Etapa **Origem** | Listar locais de origem (só Altária/Galalad e Kattawood têm detalhe) |
| **Anumanos jogáveis no MVP?** (ou seed inativo) | Catálogo da etapa **Raça** | Liberar Diffo, Feral, Gwyrá, Kãngues |
| **Lista das "Skills Próprias" da Bruxa** | Passiva racial na etapa **Perícias** | Definir o conjunto exclusivo da raça Bruxa |

### 1.2 Evolução / progressão (não bloqueiam a criação)

| Decisão | Contexto |
|---|---|
| **Habilidades iniciais por classe** | Catálogo para "+N habilidades de classe" (níveis 2/4) |
| **Habilidade especial de classe (nível 5)** | Catálogo por classe |
| **Multiclasse na evolução** | Pontos por nível são compartilhados ou alocados por classe? |
| **Combinações de classe proibidas** | Existem ou todas as duplas são livres? |
| **Atributo primário** (da especialização) | Só referência ou tem efeito mecânico? |
| **Tabela de XP além do nível 6** | Nível 7+ em aberto |

---

## 2. Implementação definida (no Compêndio, falta construir)

Tudo aqui já está especificado — é trabalho de implementação, não decisão.

### 2.1 Atributos: pool e modificadores raciais — Compêndio §2 e §4

- Cada raça concede um **pool de Pontos de Atributo** (padrão 12; Humano 16) e
  **modificadores fixos por atributo**. Valores completos no §4 do compêndio.
- Fórmula do valor final (por atributo): `distribuído + bônus_racial + evolução`.
- **Perícias não alteram atributos.**
- Modelo de dados sugerido:
  - `races.attribute_points INT NOT NULL DEFAULT 12`;
  - modificadores raciais normalizados (`race_attribute_modifiers(race_id, attribute, value)`) ou `races.attribute_modifiers JSONB`;
  - em `character_attributes`, separar `distributed` e `evolution` por atributo (o final é derivado), em vez de só o valor manual atual.
- Validação na criação depende do **teto por atributo** (§1.1) e da soma do pool.

### 2.2 Vida e capacidade de carga — Compêndio §2

- `vida_máxima = 100 + (Constituição_final × 10)`.
  ⚠️ A imagem de referência mostra `10 + Força + Constituição`; **o compêndio
  prevalece** (`100 + Con×10`).
- `capacidade (kg) = 10 + Força_final`. (Imagem mostra `10 × Força`; ignorar.)
- Vida atual é controlada pelo mestre; jogador vê só %, mestre vê absolutos,
  outros não veem nada. `0 ≤ vida_atual ≤ vida_máxima`; recalcular ao mudar Con.
- Inventário: **16 espaços fixos** na mochila; slots de anéis/colares liberados no nível 2.

### 2.3 Perícias — Compêndio §6

- O número da perícia é um **requisito de atributo (mínimo)**, não um bônus.
- Quantidade na criação: **2** por padrão; **Humano** pode ter **3** (passiva).
  Perícias raciais (origem `racial`, ex.: Brutamontes dos Ogros) **não** contam.
- Catálogo completo com requisitos no §6 (ex.: Acrobata Des≥3, Resiliência Con≥3,
  Furtividade Des≥3, Negociar Car≥3, Culinária sem requisito…).
- Origem de cada perícia: enum `racial | classe | criação | evolução | mestre`.
- Atributo cai abaixo do requisito após adquirir: **não** remove automaticamente —
  sinaliza, mantém registrada, mestre decide ativa/inativa.
- Modelo: tabela `skills(id, name, attribute, requirement_value, description, active)`
  + `character_skills(character_id, skill_id, origin)`; seed a partir do §6.
- **Ordem na criação: Perícias depois de Atributos** (o requisito checa o valor final).

### 2.4 XP e níveis — Compêndio §3

- XP concedido só pelo mestre; nível **calculado** a partir do XP acumulado.
- Tabela `level_progression(level, xp_required, gains JSONB)` (seed/config, sem
  `if/else` no código). Níveis 1–6 definidos no §3; **7+ pendente** (§1.2).
- "+N em Mente" entra na trilha de **evolução** (não na distribuição). "+1 perícia"
  segue o modelo de requisito. "Reconhecimento no mundo" é marcador narrativo no
  histórico (sem efeito mecânico).

### 2.5 Passivas raciais — Compêndio §4

- A maioria das passivas é **interpretada pelo mestre** (sem automação) e pode
  seguir como texto no `description` da raça.
- Mecanicamente relevantes (precisam de dado/efeito):
  - **Humano:** +1 perícia na criação (3 em vez de 2);
  - **Perícia racial** que não consome escolha (ex.: Brutamontes nos Ogros) → entra como `character_skills` origem `racial`;
  - **Bruxa:** raça "somente mulheres" + a **classe Bruxa** exige raça Bruxa e sexo feminino (já validado desde o MVP).

---

## 3. Relíquias — Compêndio §7

Itens narrativos concedidos pelo mestre (ex.: Sino do Vigia Morto). **Fora do
fluxo livre de criação** — não escolhíveis pelo jogador. Tratar como item
protegido, não descartável.

---

## 4. O que a Fase 4 destrava na criação de personagem

Com o acima implementado e as decisões §1.1 fechadas, o wizard ganha:

- **Origem** (depende das cidades — §1.1);
- **Atributos** (distribuir pool + bônus racial + fórmula; depende do teto — §1.1);
- **Perícias** (catálogo + requisitos + 2/3 + raciais), **após** Atributos.

Ordem final do fluxo: Identidade → Origem → Raça → Classes → Atributos → Perícias → Revisão.

---

## 5. Ordem sugerida de implementação

1. **Reseed de raças** com `attribute_points` + modificadores (Compêndio §4) — desbloqueia mostrar pontos/bônus já na etapa Raça.
2. **Atributos**: distribuição do pool + fórmula + vida/carga derivadas (depende do **teto por atributo**).
3. **Perícias**: tabela + seed (§6) + seleção 2/3 + raciais.
4. **XP/níveis**: `level_progression` + cálculo de nível.
5. **Evolução** (pontos, +perícia, +Mente, habilidades de classe) — depende das decisões §1.2.

Cada passo segue o fluxo de migrations e a revisão de RLS dos specs existentes
([security-rls.md](./security-rls.md), [testing.md](./testing.md)). Tabelas novas
ganham policies + testes de integração antes de concluir.

---

## 6. Antes de começar a Fase 4

Fechar com o mestre, no mínimo, as 4 decisões de **§1.1** (bloqueiam a criação).
As de §1.2 podem ser fechadas quando a evolução/níveis entrar. Atualizar este
documento e o `compendio-celestia` conforme cada pendência for resolvida.

Relacionado: [`compendio-celestia`](../../compendio-celestia), `.claude` §6/§14.
