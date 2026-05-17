import { css } from 'styled-components';

export const metaText = css`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: lowercase;
  color: ${({ theme }) => theme.colors.muted};
`;

export const navControlStyles = css`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: lowercase;
  color: ${({ theme }) => theme.colors.muted};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;
