import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import type { PhotoView } from '../../domain/dto/photo-view.js';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.2s ease;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: max(${({ theme }) => theme.spacing.lg}, env(safe-area-inset-top));
  left: max(${({ theme }) => theme.spacing.lg}, env(safe-area-inset-left));
  z-index: 3;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.85;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const ArrowBtn = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === 'left' ? 'left: 0' : 'right: 0')};
  transform: translateY(-50%);
  z-index: 2;
  width: 3.5rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.35;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.08;
    cursor: default;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 5rem;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: max(3.5rem, env(safe-area-inset-top))
    max(3rem, env(safe-area-inset-right))
    max(1.5rem, env(safe-area-inset-bottom))
    max(3rem, env(safe-area-inset-left));
`;

const Frame = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: min(92vw, 420px);
  width: 100%;
`;

const shimmer = keyframes`
  0% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.65;
  }
  100% {
    opacity: 0.35;
  }
`;

const ImageStage = styled.div<{ $ratio: number }>`
  position: relative;
  width: 100%;
  max-width: min(92vw, 420px);
  aspect-ratio: ${({ $ratio }) => $ratio};
  max-height: min(72vh, 720px);
  margin: 0 auto;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.border};
  touch-action: pan-y;
`;

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.colors.border};
  animation: ${shimmer} 1.6s ease-in-out infinite;
`;

const Image = styled.img<{ $loaded: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.35s ease;
`;

const Meta = styled.div`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MetaText = styled.div`
  min-width: 0;
`;

const MetaLine = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8125rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.01em;

  & + & {
    margin-top: 0.2rem;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
  }
`;

const SWIPE_THRESHOLD = 48;

function formatPhotoDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

interface PhotoViewerProps {
  photos: PhotoView[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

function ViewerImage({
  photo,
  ratio,
  onTouchStart,
  onTouchEnd,
}: {
  photo: PhotoView;
  ratio: number;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [photo.id]);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [photo.displayUrl]);

  return (
    <ImageStage
      $ratio={ratio}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {!loaded && <Placeholder aria-hidden />}
      <Image
        ref={imgRef}
        key={photo.id}
        src={photo.displayUrl}
        alt={photo.caption ?? ''}
        $loaded={loaded}
        draggable={false}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </ImageStage>
  );
}

export function PhotoViewer({
  photos,
  index,
  onClose,
  onIndexChange,
}: PhotoViewerProps) {
  const photo = photos[index];
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goPrev = useCallback(() => {
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const goNext = useCallback(() => {
    if (index < photos.length - 1) onIndexChange(index + 1);
  }, [index, photos.length, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goPrev, goNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    if (!t) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) goNext();
    else goPrev();
  };

  if (!photo) return null;

  const dateLabel = formatPhotoDate(photo.createdAt);
  const ratio =
    photo.width > 0 && photo.height > 0
      ? photo.width / photo.height
      : 1;

  return createPortal(
    <Overlay role="dialog" aria-modal="true" aria-label="Visualização da foto">
      <CloseBtn type="button" onClick={onClose} aria-label="Fechar">
        ×
      </CloseBtn>

      <ArrowBtn
        type="button"
        $side="left"
        aria-label="Foto anterior"
        disabled={index === 0}
        onClick={goPrev}
      >
        ‹
      </ArrowBtn>
      <ArrowBtn
        type="button"
        $side="right"
        aria-label="Próxima foto"
        disabled={index === photos.length - 1}
        onClick={goNext}
      >
        ›
      </ArrowBtn>

      <Content>
        <Frame>
          <ViewerImage
            photo={photo}
            ratio={ratio}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          />

          <Meta>
            <MetaText>
              <MetaLine>{photo.caption?.trim() || 'grão'}</MetaLine>
              {dateLabel && <MetaLine>{dateLabel}</MetaLine>}
            </MetaText>
          </Meta>
        </Frame>
      </Content>
    </Overlay>,
    document.body,
  );
}
