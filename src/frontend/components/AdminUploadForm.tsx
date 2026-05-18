import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { getUploadToken, uploadPhotos } from '../lib/api.js';
import { createId } from '../lib/create-id.js';
import { optimizeImageForUpload } from '../lib/optimize-image.js';
import { metaText } from '../theme/textStyles.js';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DropZone = styled.div<{ $active: boolean }>`
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.border)};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  text-transform: lowercase;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.muted};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ThumbGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ThumbWrap = styled.div`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
`;

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.bg};
  font-size: 0.875rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  ${metaText}
`;

const Input = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  letter-spacing: 0.02em;
  text-transform: none;

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.text};
  }
`;

const Submit = styled.button`
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.bg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  font-size: 0.8125rem;
  letter-spacing: 0.14em;
  text-transform: lowercase;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  ${metaText}
  color: ${({ theme }) => theme.colors.error};
  text-transform: none;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

interface QueueItem {
  id: string;
  file: File;
  preview: string;
}

function isValidImage(f: File): boolean {
  const name = f.name.toLowerCase();
  const isHeic = name.endsWith('.heic') || name.endsWith('.heif');
  return ALLOWED.has(f.type) || isHeic;
}

function fileKey(f: File): string {
  return `${f.name}:${f.size}:${f.lastModified}`;
}

interface AdminUploadFormProps {
  onUploaded: () => void;
  onAuthLost: () => void;
}

export function AdminUploadForm({ onUploaded, onAuthLost }: AdminUploadFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [caption, setCaption] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const queueRef = useRef(queue);
  queueRef.current = queue;

  useEffect(() => {
    return () => {
      for (const item of queueRef.current) URL.revokeObjectURL(item.preview);
    };
  }, []);

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter(isValidImage);
    if (list.length === 0) {
      setError('Selecione imagens (JPEG, PNG, WebP ou HEIC).');
      return;
    }

    setOptimizing(true);
    setError(null);

    try {
      const optimized = await Promise.all(list.map(optimizeImageForUpload));

      setQueue((prev) => {
        const seen = new Set(prev.map((item) => fileKey(item.file)));
        const added: QueueItem[] = [];
        for (const file of optimized) {
          const key = fileKey(file);
          if (seen.has(key)) continue;
          seen.add(key);
          added.push({
            id: createId(),
            file,
            preview: URL.createObjectURL(file),
          });
        }
        return [...prev, ...added];
      });
    } finally {
      setOptimizing(false);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = getUploadToken();
    if (queue.length === 0) {
      setError('Selecione ao menos uma foto.');
      return;
    }
    if (!password) {
      onAuthLost();
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({ done: 0, total: queue.length });

    try {
      const { uploaded, failed } = await uploadPhotos(
        queue.map((item) => item.file),
        caption,
        password,
        (done, total) => setProgress({ done, total }),
      );

      if (failed.length > 0) {
        setError(
          `${uploaded.length} enviada(s). Falharam: ${failed.map((f) => f.name).join(', ')}`,
        );
        return;
      }

      for (const item of queue) URL.revokeObjectURL(item.preview);
      setQueue([]);
      setCaption('');
      onUploaded();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro no envio.';
      if (message.toLowerCase().includes('unauthorized')) {
        onAuthLost();
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const count = queue.length;

  return (
    <Form onSubmit={onSubmit}>
      <DropZone
        $active={dragging}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click();
        }}
      >
        {count > 0 ? (
          <ThumbGrid>
            {queue.map((item) => (
              <ThumbWrap key={item.id}>
                <Thumb src={item.preview} alt="" />
                <RemoveBtn
                  type="button"
                  aria-label="Remover"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    removeItem(item.id);
                  }}
                >
                  ×
                </RemoveBtn>
              </ThumbWrap>
            ))}
          </ThumbGrid>
        ) : optimizing ? (
          'otimizando fotos…'
        ) : (
          'arraste ou escolha fotos'
        )}
      </DropZone>

      <HiddenInput
        ref={fileRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <Label>
        legenda (todas)
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="opcional"
        />
      </Label>

      {progress && (
        <p style={{ fontSize: '0.85rem', color: 'inherit', opacity: 0.6 }}>
          Enviando {progress.done} de {progress.total}…
        </p>
      )}

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Submit type="submit" disabled={loading || optimizing || count === 0}>
        {loading
          ? progress
            ? `enviando ${progress.done}/${progress.total}…`
            : 'enviando…'
          : count > 1
            ? `publicar ${count} fotos`
            : 'publicar'}
      </Submit>
    </Form>
  );
}
