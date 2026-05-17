import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  COLOR_MODE_STORAGE_KEY,
  createTheme,
  readInitialColorMode,
  type AppTheme,
  type ColorMode,
} from '../theme/theme.js';

interface ColorModeContextValue {
  mode: ColorMode;
  theme: AppTheme;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

function applyDocumentMode(mode: ColorMode) {
  document.documentElement.dataset.colorMode = mode;
  document.documentElement.style.colorScheme = mode;
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(() =>
    typeof document !== 'undefined' ? readInitialColorMode() : 'light',
  );

  useEffect(() => {
    applyDocumentMode(mode);
  }, [mode]);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    applyDocumentMode(next);
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyDocumentMode(next);
      try {
        localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      theme: createTheme(mode),
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode],
  );

  return (
    <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useColorMode must be used within ColorModeProvider');
  }
  return ctx;
}
