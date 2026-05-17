import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { PhotoView } from '../../domain/dto/photo-view.js';
import { useSsrData } from '../context/SsrDataContext.js';
import { fetchPhotos } from '../lib/api.js';
import { FeedHero } from '../components/FeedHero.js';
import { PhotoGrid } from '../components/PhotoGrid.js';
import { PhotoGridSkeleton } from '../components/PhotoGridSkeleton.js';
import { PhotoViewer } from '../components/PhotoViewer.js';
import { metaText } from '../theme/textStyles.js';

const Page = styled.div`
  width: 100%;
`;

const Empty = styled.p`
  ${metaText}
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.xl};
`;

const ErrorMsg = styled.p`
  ${metaText}
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
`;

const Sentinel = styled.div`
  height: 1px;
`;

export function Feed() {
  const ssr = useSsrData();
  const initialFeed = ssr?.feed;

  const [photos, setPhotos] = useState<PhotoView[]>(initialFeed?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(
    initialFeed?.nextCursor ?? null,
  );
  const [hasMore, setHasMore] = useState(
    initialFeed ? initialFeed.nextCursor !== null : true,
  );
  const [loading, setLoading] = useState(!initialFeed);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(Boolean(initialFeed));
  const loadInFlightRef = useRef(false);

  const load = useCallback(async (nextCursor?: string) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;

    const isMore = Boolean(nextCursor);
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await fetchPhotos(nextCursor);
      setPhotos((prev) => (isMore ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
      setError(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'não foi possível carregar as fotos';
      setError(msg);
    } finally {
      loadInFlightRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (hydratedRef.current) {
      hydratedRef.current = false;
      return;
    }
    load();
  }, [load]);

  useEffect(() => {
    if (!hasMore || loading) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          cursor &&
          !loadingMore &&
          !loadInFlightRef.current
        ) {
          load(cursor);
        }
      },
      { rootMargin: '400px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, hasMore, load, loading, loadingMore]);

  if (loading) {
    return (
      <Page>
        <FeedHero />
        <PhotoGridSkeleton count={12} />
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <FeedHero />
        <ErrorMsg>{error}</ErrorMsg>
      </Page>
    );
  }

  if (photos.length === 0) {
    return (
      <Page>
        <FeedHero />
        <Empty>nenhuma foto ainda</Empty>
      </Page>
    );
  }

  return (
    <Page>
      <FeedHero />
      <PhotoGrid
        photos={photos}
        onSelect={(_, index) => setViewerIndex(index)}
      />
      {hasMore && <Sentinel ref={sentinelRef} />}
      {loadingMore && <PhotoGridSkeleton count={6} />}
      {viewerIndex !== null && (
        <PhotoViewer
          photos={photos}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onIndexChange={setViewerIndex}
        />
      )}
    </Page>
  );
}
