# Spec — Upload de imagens

Padrão único para qualquer upload de imagem no Celestia (campanha, personagem,
e elementos futuros). A implementação de **campanha** é a referência concreta;
novos fluxos devem reusar a mesma infraestrutura e seguir este documento.

> Estado: infraestrutura genérica pronta — helper `image-storage.ts` e componente
> `<ImageUploadField>` (§4/§6). O fluxo de **campanha** consome ambos e serve de
> referência. Novos fluxos seguem o checklist da §9.

---

## 1. Princípios

- **Formato único: WebP.** Um só formato simplifica validação, storage e exibição.
- **Validação em profundidade:** cliente (UX) + Server Action (autoridade) + bucket (`allowed_mime_types`/`file_size_limit`) + RLS de storage.
- **Ownership por pasta:** o caminho começa com `auth.uid()`; a policy de storage garante que cada usuário só escreve na própria pasta.
- **Leitura pública:** imagens de campanha/personagem são dados públicos aos participantes (§5.6 do `.claude`), então os buckets são públicos. **Não** colocar imagem privada/sensível nesses buckets.
- **O arquivo é um ponteiro:** a tabela da entidade guarda apenas a `*_url`. Trocar/remover imagem = atualizar a coluna + apagar o arquivo anterior (best-effort).

## 2. Constraints padrão

| Item | Valor |
|---|---|
| Formato | `image/webp` apenas |
| Tamanho máximo | 2 MB (`2097152` bytes) |
| Caminho | `{auth.uid()}/{uuid}.webp` |
| Coluna na entidade | `image_url TEXT` (nullable) |
| Leitura | pública (bucket público) |
| Escrita | apenas o dono da pasta (`authenticated`) |

Mudou um limite? Atualize **os quatro pontos**: cliente, helper do servidor, bucket
(`file_size_limit`/`allowed_mime_types`) e este documento.

## 3. Storage: buckets e RLS

**Um bucket por tipo de entidade** (`campaign-images`, `character-images`, …) —
isola limites e facilita políticas. Todos seguem o mesmo gabarito de policies.

Template de migration (trocar `<BUCKET>`):

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('<BUCKET>', '<BUCKET>', true, 2097152, ARRAY['image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "<BUCKET>: leitura pública"
  ON storage.objects FOR SELECT USING (bucket_id = '<BUCKET>');

CREATE POLICY "<BUCKET>: usuário envia na própria pasta"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = '<BUCKET>' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "<BUCKET>: dono atualiza"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = '<BUCKET>' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "<BUCKET>: dono remove"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = '<BUCKET>' AND (storage.foldername(name))[1] = auth.uid()::text);
```

Referência: [`0017_campaign_images_bucket.sql`](../../supabase/migrations/0017_campaign_images_bucket.sql).
Buckets entram por migration (recriados em `supabase db reset`), como o resto do schema.

> **Nota de ownership:** o arquivo pertence a quem fez o upload. Se o mestre enviar
> a imagem de um personagem de jogador, o arquivo cai na pasta do mestre — tudo
> bem, pois a leitura é pública e a entidade só guarda a URL. A autorização de
> *quem pode editar a entidade* é da camada de serviço/RLS da tabela, não do storage.

## 4. Camada de infraestrutura (helper genérico)

`src/infrastructure/storage/image-storage.ts`, parametrizado por bucket:

```ts
const MAX_BYTES = 2 * 1024 * 1024;

export async function uploadImage(
  supabase: CelestiaClient,
  bucket: string,
  userId: string,
  file: File,
): Promise<string> {
  if (file.type !== 'image/webp') throw new ValidationError('A imagem deve estar no formato WebP');
  if (file.size > MAX_BYTES) throw new ValidationError('A imagem deve ter no máximo 2 MB');
  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: 'image/webp' });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function deleteImageByUrl(supabase: CelestiaClient, bucket: string, url: string): Promise<void> {
  const marker = `/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = url.slice(i + marker.length);
  if (path) { try { await supabase.storage.from(bucket).remove([path]); } catch { /* best-effort */ } }
}
```

Cada entidade tem um wrapper fino que fixa o bucket — ex.:
[`campaign-image.ts`](../../src/infrastructure/storage/campaign-image.ts)
(`uploadCampaignImage`/`deleteCampaignImage`, bucket `campaign-images`). Para um
novo fluxo, crie um wrapper análogo (ex.: `character-image.ts`).

## 5. Server Action (fluxo)

O arquivo trafega no `FormData` do Server Action. Padrão:

```ts
function imageFile(formData: FormData): File | null {
  const f = formData.get('image');
  return f instanceof File && f.size > 0 ? f : null;
}
```

- **Criar:** `const url = file ? await uploadImage(...) : null;` e persiste.
- **Editar:** `imageUrl` é **`undefined` = preserva**, **`null` = remove**, **string = nova**.
  Depois do update, apaga o arquivo anterior se trocou ou removeu:

```ts
const current = await getEntityById(supabase, id);
const file = imageFile(formData);
let imageUrl: string | null | undefined;
if (file) imageUrl = await uploadImage(supabase, BUCKET, user.id, file);
else if (formData.get('removeImage') === 'true') imageUrl = null;

const entity = await service.update(supabase, user.id, id, {
  ...fields,
  ...(imageUrl !== undefined && { imageUrl }),
});

if (imageUrl !== undefined && current?.imageUrl && current.imageUrl !== imageUrl) {
  await deleteImageByUrl(supabase, BUCKET, current.imageUrl);
}
```

Referência: [`campaign.actions.ts`](../../src/features/campaigns/actions/campaign.actions.ts).
A função de repositório `update` deve **só tocar a coluna quando `imageUrl !== undefined`**
(ver `updateCampaign`), para que "sem novo arquivo" preserve a imagem.

## 6. UI — campo de upload

Componente reutilizável [`<ImageUploadField>`](../../src/shared/ui/ImageUploadField.tsx)
(`@/shared/ui`). Cuida de tudo: input de arquivo, prévia ao vivo
(`URL.createObjectURL`), botões Alterar/Remover, hidden `removeImage` e validação
client-side espelhando a §2. O visual da prévia/placeholder é do chamador, via
`renderPreview`:

```tsx
<ImageUploadField
  defaultUrl={defaultValues?.imageUrl}
  renderPreview={(src) => <CampaignIllustration src={src} name="Prévia" className="aspect-[4/3] w-full" />}
/>
```

Uso de referência: [`CampaignForm.tsx`](../../src/features/campaigns/components/CampaignForm.tsx).

## 7. Ciclo de vida do arquivo

| Ação | Coluna `*_url` | Arquivo |
|---|---|---|
| Criar com imagem | nova URL | upload |
| Editar sem mexer | inalterada | nenhum |
| Trocar imagem | nova URL | upload novo + **apaga o antigo** |
| Remover imagem | `null` | **apaga o antigo** |

A remoção do arquivo antigo é **best-effort**: falha de storage não bloqueia o save
(evita deixar a entidade inconsistente). Órfãos eventuais são aceitáveis — ver §11.

## 8. next.config

Uploads passam pelo Server Action; o limite padrão é 1 MB. Já elevado para 3 MB em
[`next.config.ts`](../../next.config.ts) (`experimental.serverActions.bodySizeLimit`).
Reiniciar o `dev` após mudar. Se adotar `next/image` para exibir, configurar
`images.remotePatterns` com o host do Supabase (hoje usamos `<img>` simples).

## 9. Checklist — novo fluxo de imagem

Para adicionar imagem a uma entidade (ex.: personagem):

1. Migration: `image_url TEXT` na tabela + bucket `<entidade>-images` com as 4 policies (§3).
2. Tipos: `image_url` no `database.ts` (Row/Insert/Update) e `imageUrl` no domínio.
3. Repositório: mapear no `rowTo...`; `create` aceita `imageUrl`; `update` só toca a coluna quando definido.
4. Service/Action: usar `uploadImage`/`deleteImageByUrl` com o bucket da entidade (§5).
5. UI: campo de upload (§6).
6. Validar end-to-end: upload na própria pasta OK, pasta alheia bloqueada, URL pública 200, remoção → 404/400.

## 10. Decisões em aberto / futuro

- **Conversão para WebP no cliente** (aceitar PNG/JPG e converter via canvas) — hoje exigimos `.webp`.
- **Transformação/thumbnails** (Supabase Image Transformation é plano Pro) — hoje servimos o original.
- **Limpeza de órfãos** — best-effort deixa rastros raros; um job/edge function pode varrer arquivos sem `*_url` correspondente.
- **Imagens privadas** (ex.: anexos de ficha só para dono/mestre) exigiriam bucket privado + URLs assinadas; **fora** deste spec, que cobre imagens públicas aos participantes.

Relacionado: [`security-rls.md`](./security-rls.md), [`testing.md`](./testing.md).
