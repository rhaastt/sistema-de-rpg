'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';

// Espelha as constraints do servidor (docs/specs/image-uploads.md §2).
const ACCEPTED = 'image/webp';
const MAX_BYTES = 2 * 1024 * 1024;

interface Props {
  /** URL atual da imagem (modo edição). */
  defaultUrl?: string | null | undefined;
  /** Nome do input de arquivo no FormData. */
  name?: string;
  /** Nome do hidden que sinaliza remoção. */
  removeFieldName?: string;
  hint?: string;
  /** Renderiza a prévia/placeholder; recebe a URL atual (ou null). */
  renderPreview: (src: string | null) => ReactNode;
}

/**
 * Campo genérico de upload de imagem (.webp): prévia ao vivo, botão de
 * trocar/remover e hidden de remoção. A lógica de storage fica na action
 * (ver docs/specs/image-uploads.md §5/§6).
 */
export function ImageUploadField({
  defaultUrl,
  name = 'image',
  removeFieldName = 'removeImage',
  hint = 'Formato WebP, até 2 MB.',
  renderPreview,
}: Props) {
  const [preview, setPreview] = useState(defaultUrl ?? '');
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== ACCEPTED) {
      setError('Use uma imagem no formato WebP (.webp).');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('A imagem deve ter no máximo 2 MB.');
      e.target.value = '';
      return;
    }
    setError(null);
    setRemoved(false);
    setPreview(URL.createObjectURL(file));
  }

  function onRemove() {
    setRemoved(true);
    setPreview('');
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-3">
      {renderPreview(preview || null)}
      <input ref={fileRef} type="file" name={name} accept={ACCEPTED} onChange={onPick} className="hidden" />
      <input type="hidden" name={removeFieldName} value={removed ? 'true' : 'false'} />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="small"
          className="flex-1"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? 'Alterar imagem' : 'Selecionar imagem'}
        </Button>
        {preview && (
          <Button type="button" variant="secondary" size="small" onClick={onRemove}>
            Remover
          </Button>
        )}
      </div>
      <p className="text-label text-content-secondary">{hint}</p>
      {error && <p className="text-small text-content">{error}</p>}
    </div>
  );
}
