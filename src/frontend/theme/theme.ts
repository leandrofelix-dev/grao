export type ColorMode = 'light' | 'dark';

const shared = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3.5rem',
    '3xl': '5rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  fonts: {
    display: '"Bodoni Moda", "Cormorant Garamond", Georgia, serif',
    body: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
  },
} as const;

const palettes = {
  light: {
    bg: '#f4efe6',
    surface: '#f4efe6',
    text: '#000000',
    muted: '#4a4540',
    accent: '#000000',
    border: '#cfc4b4',
    error: '#8f2e1f',
  },
  dark: {
    bg: '#0f0e0d',
    surface: '#1a1816',
    text: '#f2ece4',
    muted: '#9c958c',
    accent: '#f2ece4',
    border: '#2e2a26',
    error: '#d48478',
  },
} as const;

export function createTheme(mode: ColorMode) {
  return {
    mode,
    colors: palettes[mode],
    ...shared,
  };
}

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

export type AppTheme = ReturnType<typeof createTheme>;

export const COLOR_MODE_STORAGE_KEY = 'grao-color-mode';

export function readStoredColorMode(): ColorMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return null;
}

export function readInitialColorMode(): ColorMode {
  const fromDom = document.documentElement.dataset.colorMode;
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;

  const stored = readStoredColorMode();
  if (stored) return stored;

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}
