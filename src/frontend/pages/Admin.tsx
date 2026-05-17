import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import type { AdminPhotoFilter, AdminPhotoView } from '../../domain/dto/admin-photo-view.js';
import { AdminPhotoRow } from '../components/AdminPhotoRow.js';
import { AdminUploadForm } from '../components/AdminUploadForm.js';
import { UploadGate } from '../components/UploadGate.js';
import {
  clearUploadToken,
  fetchAdminPhotos,
  getUploadToken,
  verifyUploadPassword,
} from '../lib/api.js';
import { metaText } from '../theme/textStyles.js';

const Page = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl}
    ${({ theme }) => theme.spacing['3xl']};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: lowercase;
`;

const LogoutBtn = styled.button`
  ${metaText}
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const SectionTitle = styled.h2`
  ${metaText}
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Tab = styled.button<{ $active: boolean }>`
  ${metaText}
  opacity: ${({ $active }) => ($active ? 1 : 0.45)};
  border-bottom: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.text : 'transparent')};
  padding-bottom: ${({ theme }) => theme.spacing.xs};

  &:hover {
    opacity: 1;
  }
`;

const Empty = styled.p`
  ${metaText}
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const ErrorMsg = styled.p`
  ${metaText}
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const LoadMore = styled.button`
  ${metaText}
  display: block;
  margin: ${({ theme }) => theme.spacing.lg} auto 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const BackLink = styled(Link)`
  ${metaText}
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.lg};
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`;

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [filter, setFilter] = useState<AdminPhotoFilter>('published');
  const [photos, setPhotos] = useState<AdminPhotoView[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listKey, setListKey] = useState(0);

  const load = useCallback(
    async (nextCursor?: string) => {
      const isMore = Boolean(nextCursor);
      if (isMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const data = await fetchAdminPhotos(filter, nextCursor);
        setPhotos((prev) => (isMore ? [...prev, ...data.items] : data.items));
        setCursor(data.nextCursor);
        setHasMore(data.nextCursor !== null);
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar.';
        if (msg.toLowerCase().includes('sessão') || msg.toLowerCase().includes('unauthorized')) {
          onLogout();
          return;
        }
        setError(msg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter, onLogout],
  );

  useEffect(() => {
    load();
  }, [filter, listKey, load]);

  const refreshList = () => {
    setFilter('published');
    setListKey((k) => k + 1);
  };

  return (
    <Page>
      <TopRow>
        <Title>admin</Title>
        <LogoutBtn type="button" onClick={onLogout}>
          sair
        </LogoutBtn>
      </TopRow>

      <Section>
        <SectionTitle>novas fotos</SectionTitle>
        <AdminUploadForm onUploaded={refreshList} onAuthLost={onLogout} />
      </Section>

      <Section>
        <SectionTitle>gerenciar</SectionTitle>
        <Tabs>
          <Tab
            type="button"
            $active={filter === 'published'}
            onClick={() => setFilter('published')}
          >
            publicadas
          </Tab>
          <Tab
            type="button"
            $active={filter === 'archived'}
            onClick={() => setFilter('archived')}
          >
            arquivadas
          </Tab>
        </Tabs>

        {loading && <Empty>carregando…</Empty>}
        {error && !loading && <ErrorMsg>{error}</ErrorMsg>}

        {!loading && !error && photos.length === 0 && (
          <Empty>
            {filter === 'archived'
              ? 'nenhuma foto arquivada'
              : 'nenhuma foto publicada'}
          </Empty>
        )}

        {!loading &&
          photos.map((photo) => (
            <AdminPhotoRow
              key={photo.id}
              photo={photo}
              onChange={(updated) => {
                setPhotos((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p)),
                );
              }}
              onRemove={(id) => {
                setPhotos((prev) => prev.filter((p) => p.id !== id));
              }}
              onAuthLost={onLogout}
            />
          ))}

        {hasMore && !loading && (
          <LoadMore
            type="button"
            disabled={loadingMore}
            onClick={() => cursor && load(cursor)}
          >
            {loadingMore ? 'carregando…' : 'carregar mais'}
          </LoadMore>
        )}
      </Section>

      <BackLink to="/">← voltar ao feed</BackLink>
    </Page>
  );
}

export function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getUploadToken();
    if (!token) {
      setUnlocked(false);
      setChecking(false);
      return;
    }

    verifyUploadPassword(token)
      .then(() => setUnlocked(true))
      .catch(() => {
        clearUploadToken();
        setUnlocked(false);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = () => {
    clearUploadToken();
    setUnlocked(false);
  };

  if (checking) return null;

  if (!unlocked) {
    return (
      <Page>
        <Title>admin</Title>
        <UploadGate onUnlocked={() => setUnlocked(true)} />
      </Page>
    );
  }

  return <AdminPanel onLogout={handleLogout} />;
}
