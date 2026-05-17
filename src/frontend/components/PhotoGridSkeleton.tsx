import styled, { keyframes } from 'styled-components';

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

const Block = styled.div<{ $ratio: number }>`
  width: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  break-inside: avoid;
  background: ${({ theme }) => theme.colors.border};
  animation: ${shimmer} 1.6s ease-in-out infinite;
`;

/** Proporções variadas para lembrar um grid masonry de fotos. */
const RATIOS = [0.75, 1.15, 0.85, 1.35, 0.95, 1.2, 0.8, 1.05, 1.25, 0.7, 1.1, 0.9];

interface PhotoGridSkeletonProps {
  count?: number;
}

export function PhotoGridSkeleton({ count = 12 }: PhotoGridSkeletonProps) {
  return (
    <GridFrame aria-hidden>
      <Grid>
        {Array.from({ length: count }, (_, i) => (
          <Block key={i} $ratio={RATIOS[i % RATIOS.length]!} />
        ))}
      </Grid>
    </GridFrame>
  );
}
