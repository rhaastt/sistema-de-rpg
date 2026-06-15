# Spec — Segurança e RLS

Documento de referência das políticas de Row Level Security do Celestia. Toda
autorização é feita no banco; a UI nunca é a fonte de verdade (seção 11 do
`.claude`). Este arquivo deve ser atualizado sempre que uma policy mudar.

> Estado: migrations `0001`–`0015` aplicadas. 31 policies ativas.

---

## 1. Modelo de papéis

| Papel | Origem | Pode |
|---|---|---|
| `anon` | requisição sem sessão | apenas o que tiver policy + GRANT explícito (hoje: nada de escrita) |
| `authenticated` | usuário logado (JWT com `sub` = `auth.uid()`) | SELECT/INSERT/UPDATE conforme policies; **nunca DELETE** |
| `service_role` | apenas server-side (chave secreta, nunca no cliente) | ignora RLS; tem DELETE administrativo (migration 0015) |

GRANT e RLS são camadas independentes: sem o GRANT (migrations 0011/0015) o
Postgres bloqueia antes de avaliar a policy. `service_role` ignora RLS mas
**não** ignora GRANT de tabela.

## 2. Funções auxiliares (SECURITY DEFINER, STABLE)

- `is_campaign_master(campaign_id)` → `owner_id = auth.uid()` na tabela `campaigns`.
- `is_campaign_member(campaign_id)` → existe `campaign_members` ativo (`removed_at IS NULL`) para `auth.uid()`.

⚠️ Por serem `STABLE`, ver o item 5 (gotcha do `insert().select()`).

## 3. Matriz de policies

### profiles
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | leitura pública / busca por email | `true` / `auth.uid() IS NOT NULL` |
| UPDATE | edição pelo próprio usuário | `id = auth.uid()` |

### campaigns
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | participantes veem a campanha | `is_campaign_member(id)` |
| SELECT | **mestre vê própria campanha** (0012) | `owner_id = auth.uid()` |
| INSERT | mestre cria | `owner_id = auth.uid()` |
| UPDATE | mestre edita | `owner_id = auth.uid()` |
| DELETE | — | sem policy (arquivamento via `status`/`archived_at`) |

### campaign_members
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | participantes veem membros | `is_campaign_member(campaign_id)` |
| SELECT | **usuário vê a própria associação** (0013) | `user_id = auth.uid()` |
| INSERT | trigger insere mestre | `false` (via trigger SECURITY DEFINER) |
| INSERT | jogador entra via convite aceito | `role='player' AND user_id=auth.uid() AND` existe invite `accepted` |
| UPDATE | mestre remove participante | `is_campaign_master(campaign_id)` (soft-remove via `removed_at`) |

### invites
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | mestre vê convites / convidado vê o seu | `is_campaign_master(campaign_id) OR invitee_id = auth.uid()` |
| INSERT | mestre cria convite | `is_campaign_master(campaign_id) AND inviter_id = auth.uid()` |
| UPDATE | mestre ou convidado atualiza status | `is_campaign_master(campaign_id) OR invitee_id = auth.uid()` |

### characters
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | mestre vê todos | `is_campaign_master(campaign_id)` |
| SELECT | jogador vê o próprio | `owner_id = auth.uid() AND is_campaign_member(campaign_id)` |
| SELECT | participantes veem dados básicos | `is_campaign_member(campaign_id)` |
| INSERT | jogador cria o próprio | `owner_id = auth.uid() AND is_campaign_member(campaign_id)` |
| UPDATE | jogador edita se desbloqueada / mestre sempre | `(owner_id=auth.uid() AND NOT sheet_locked AND membro) OR mestre` |

> Visibilidade pública × privada (seção 5.6): a tabela `characters` é legível por
> qualquer membro (dados básicos). Os dados privados ficam em
> `character_attributes`, protegidos por policy própria — é o RLS de atributos,
> não o de `characters`, que esconde o privado de outros jogadores.

### character_classes
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | participante da campanha | via `EXISTS characters c ... is_campaign_member` |
| INSERT/UPDATE | dono ou mestre, ficha não bloqueada | via `EXISTS characters c ... (owner OR mestre) AND NOT sheet_locked` |

### character_attributes
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | dono e mestre veem | `EXISTS characters c ... (owner OR mestre)` |
| UPDATE | dono se desbloqueado / mestre sempre | idem com `NOT sheet_locked` para o dono |

### history_log
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | participantes veem histórico | `is_campaign_member(campaign_id)` |
| INSERT | participante registra evento próprio | `actor_id=auth.uid() AND is_campaign_member(campaign_id)` |
| INSERT | **convidado registra evento do próprio convite** (0014) | `actor_id=auth.uid() AND EXISTS invite para auth.uid()` |
| DELETE/UPDATE | — | sem policy (histórico imutável) |

### races / classes / specializations (catálogos)
| Cmd | Policy | Regra |
|---|---|---|
| SELECT | leitura para autenticados | `auth.uid() IS NOT NULL` |
| escrita | — | apenas via migrations/seeds |

## 4. GRANTs

- `0011` — SELECT/INSERT/UPDATE para `authenticated` e `service_role` nas tabelas de escrita; SELECT nos catálogos; USAGE em sequências.
- `0015` — **DELETE apenas para `service_role`** (limpeza administrativa e teardown de testes). `anon`/`authenticated` continuam sem DELETE e sem policy de DELETE → a API pública nunca apaga dados.

## 5. ⚠️ Gotcha: `insert(...).select()` e RETURNING

O cliente PostgREST usa `insert(...).select()` (RETURNING). O Postgres aplica a
policy de **SELECT** sobre a linha recém-inserida. Se a policy de SELECT depender
de uma função `STABLE` (`is_campaign_member`) que precisa enxergar uma linha
criada **no mesmo statement** (ex.: por um trigger `AFTER INSERT`), ela usa o
snapshot do statement e **não vê** a linha → o INSERT falha com
`42501 new row violates row-level security policy`, mesmo com o `WITH CHECK` ok.

**Sintoma:** INSERT sem RETURNING passa; com `.select()` falha.

**Solução adotada (migrations 0012/0013):** adicionar uma policy de SELECT direta
e independente da função — `owner_id = auth.uid()` / `user_id = auth.uid()`.
Sempre que criar uma entidade cuja visibilidade dependa de membership criada por
trigger, garanta um caminho de SELECT direto pelo dono.

## 6. Como validar

Os testes de integração (`tests/integration/`) exercitam essas policies com
usuários reais autenticados — ver `docs/specs/testing.md`. Rodar `npm test` antes
de qualquer mudança em RLS. Para inspeção pontual:

```bash
docker exec -it supabase_db_rpg-celestia psql -U postgres -d postgres \
  -c "SELECT polname, polcmd FROM pg_policy WHERE polrelid='public.campaigns'::regclass;"
```
