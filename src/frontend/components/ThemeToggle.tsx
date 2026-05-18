import styled from 'styled-components';
import { useColorMode } from '../context/ColorModeContext.js';

const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: ${({ theme }) => theme.colors.muted};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M20 14.5A7.5 7.5 0 0 1 9.5 4 9 9 0 0 0 20 14.5z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { mode, toggleMode } = useColorMode();

  return (
    <Btn
      type="button"
      onClick={toggleMode}
      suppressHydrationWarning
      aria-label={mode === 'dark' ? 'Ativar modo claro' : 'Ativar modo noturno'}
    >
      {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Btn>
  );
}
