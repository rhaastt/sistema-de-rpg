'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Button, ImageUploadField, Input } from '@/shared/ui';
import type { ActionResult } from '@/shared/types/action-result';
import type { Campaign } from '@/domain/campaign/types';
import { CampaignIllustration } from './CampaignIllustration';

const DESCRIPTION_MAX = 600;

interface Props {
  action: (prevState: ActionResult<Campaign>, formData: FormData) => Promise<ActionResult<Campaign>>;
  defaultValues?: { name?: string; description?: string | null; imageUrl?: string | null };
  submitLabel?: string;
  cancelHref: string;
}

const initialState: ActionResult<Campaign> = { success: true, data: undefined as unknown as Campaign };

export function CampaignForm({ action, defaultValues, submitLabel = 'Salvar', cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [description, setDescription] = useState(defaultValues?.description ?? '');

  return (
    <form action={formAction} className="grid gap-8 md:grid-cols-[240px_1fr]">
      {!state.success && (
        <p className="rounded-control border-2 border-stroke bg-page p-3 text-small text-content md:col-span-2">
          {state.error}
        </p>
      )}

      {/* Coluna da imagem */}
      <ImageUploadField
        defaultUrl={defaultValues?.imageUrl}
        renderPreview={(src) => (
          <CampaignIllustration src={src} name="Prévia da campanha" className="aspect-[4/3] w-full" />
        )}
      />

      {/* Coluna dos campos */}
      <div className="flex flex-col gap-5">
        <Input
          id="name"
          name="name"
          label="Título da campanha"
          required
          maxLength={120}
          defaultValue={defaultValues?.name}
          placeholder="Nome da campanha"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-label font-medium text-content">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o conceito, tema e objetivos da campanha..."
            className="w-full rounded-control border-2 border-stroke-subtle bg-input px-4 py-3 text-body text-content placeholder:text-content-secondary/70 focus:border-stroke-active focus:outline-none"
          />
          <span className="self-end text-label text-content-secondary">
            {description.length} / {DESCRIPTION_MAX}
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href={cancelHref as Route}>
            <Button variant="secondary" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
