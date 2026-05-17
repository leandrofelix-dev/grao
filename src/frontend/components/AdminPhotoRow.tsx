import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { AdminPhotoView } from '../../domain/dto/admin-photo-view.js';
import {
  deletePhoto,
  setPhotoArchived,
  updatePhotoCaption,
} from '../lib/api.js';
import { metaText } from '../theme/textStyles.js';

const Row = styled.article`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 96px 1fr;
  }
`;

const Thumb = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.border};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

const CaptionInput = styled.textarea`
  width: 100%;
  min-height: 2.5rem;
  resize: vertical;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  font-size: 0.9375rem;
  line-height: 1.4;
  letter-spacing: 0.02em;

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.text};
  }
`;

const Meta = styled.p`
  ${metaText}
  text-transform: none;
  letter-spacing: 0.02em;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  ${metaText}
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: lowercase;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.error : theme.colors.text)};
  border: 1px solid
    ${({ theme, $danger }) => ($danger ? theme.colors.error : theme.colors.border)};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.text};
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

const ErrorMsg = styled.p`
  ${metaText}
  color: ${({ theme }) => theme.colors.error};
  text-transform: none;
`;

interface AdminPhotoRowProps {
  photo: AdminPhotoView;
  onChange: (photo: AdminPhotoView) => void;
  onRemove: (id: string) => void;
  onAuthLost: () => void;
}

export function AdminPhotoRow({
  photo,
  onChange,
  onRemove,
  onAuthLost,
}: AdminPhotoRowProps) {
  const [caption, setCaption] = useState(photo.caption ?? '');
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setCaption(photo.caption ?? '');
    setConfirmDelete(false);
    setError(null);
  }, [photo.id, photo.caption]);

  const isArchived = photo.archivedAt !== null;
  const dirty = caption !== (photo.caption ?? '');

  const handleAuthError = (err: unknown) => {
    const message = err instanceof Error ? err.message : '';
    if (message.toLowerCase().includes('sessão') || message.toLowerCase().includes('unauthorized')) {
      onAuthLost();
      return true;
    }
    return false;
  };

  const saveCaption = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePhotoCaption(photo.id, caption);
      onChange(updated);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await setPhotoArchived(photo.id, !isArchived);
      onRemove(photo.id);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof Error ? err.message : 'Erro ao arquivar.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await deletePhoto(photo.id);
      onRemove(photo.id);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir.');
      }
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  };

  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(photo.createdAt));

  return (
    <Row>
      <Thumb src={photo.thumbUrl} alt="" />
      <Body>
        <CaptionInput
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="legenda"
          rows={2}
        />
        <Meta>{dateLabel}</Meta>
        <Actions>
          {dirty && (
            <ActionBtn type="button" disabled={saving} onClick={saveCaption}>
              {saving ? 'salvando…' : 'salvar legenda'}
            </ActionBtn>
          )}
          <ActionBtn type="button" disabled={busy} onClick={toggleArchive}>
            {isArchived ? 'desarquivar' : 'arquivar'}
          </ActionBtn>
          {!confirmDelete ? (
            <ActionBtn
              type="button"
              $danger
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              excluir
            </ActionBtn>
          ) : (
            <>
              <ActionBtn type="button" disabled={busy} onClick={() => setConfirmDelete(false)}>
                cancelar
              </ActionBtn>
              <ActionBtn type="button" $danger disabled={busy} onClick={handleDelete}>
                {busy ? 'excluindo…' : 'confirmar'}
              </ActionBtn>
            </>
          )}
        </Actions>
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Body>
    </Row>
  );
}
