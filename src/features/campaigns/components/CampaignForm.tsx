'use client';

import { useActionState } from 'react';
import type { ActionResult } from '@/shared/types/action-result';
import type { Campaign } from '@/domain/campaign/types';

interface Props {
  action: (formData: FormData) => Promise<ActionResult<Campaign>>;
  defaultValues?: { name?: string; description?: string | null };
  submitLabel?: string;
}

const initialState: ActionResult<Campaign> = { success: true, data: undefined as unknown as Campaign };

export function CampaignForm({ action, defaultValues, submitLabel = 'Salvar' }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {!state.success && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome da campanha <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          defaultValue={defaultValues?.name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={defaultValues?.description ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? 'Salvando...' : submitLabel}
      </button>
    </form>
  );
}
