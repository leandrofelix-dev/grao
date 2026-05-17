import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { PhotoView } from '../../domain/dto/photo-view.js';

const GridFrame = styled.div`
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  box-sizing: border-box;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 0 ${({ theme }) => theme.spacing['2xl']};
  }
`;

const Grid = styled.div`
  column-count: 2;
  column-gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    column-count: 3;
  }
`;

const Cell = styled.button`
  display: block;
  width: 100%;
  break-inside: avoid;
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding: 0;
  cursor: pointer;
  text-align: left;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.text};
    outline-offset: 2px;
  }

  &:hover img {
    opacity: 0.92;
  }
`;

const ImageWrap = styled.div<{ $ratio: number }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.border};
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
  object-fit: cover;
  display: block;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.35s ease;
`;

interface PhotoGridProps {
  photos: PhotoView[];
  onSelect: (photo: PhotoView, index: number) => void;
}

function PhotoCell({
  photo,
  index,
  onSelect,
}: {
  photo: PhotoView;
  index: number;
  onSelect: (photo: PhotoView, index: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const ratio =
    photo.width > 0 && photo.height > 0
      ? photo.width / photo.height
      : 1;

  useEffect(() => {
    setLoaded(false);
  }, [photo.id]);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [photo.displayUrl]);

  return (
    <Cell
      type="button"
      onClick={() => onSelect(photo, index)}
      aria-label={photo.caption ?? 'Abrir foto'}
    >
      <ImageWrap $ratio={ratio}>
        {!loaded && <Placeholder />}
        <Image
          ref={imgRef}
          src={photo.displayUrl}
          alt={photo.caption ?? ''}
          $loaded={loaded}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      </ImageWrap>
    </Cell>
  );
}

export function PhotoGrid({ photos, onSelect }: PhotoGridProps) {
  return (
    <GridFrame>
      <Grid>
        {photos.map((photo, index) => (
          <PhotoCell
            key={photo.id}
            photo={photo}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </Grid>
    </GridFrame>
  );
}
