import { ThemeProvider } from 'styled-components';
import type { SsrPayload } from '../domain/dto/photo-view.js';
import { ColorModeProvider, useColorMode } from './context/ColorModeContext.js';
import { SsrDataProvider } from './context/SsrDataContext.js';
import App from './App.js';
import { GlobalStyles } from './theme/globalStyles.js';

function ThemedApp() {
  const { theme } = useColorMode();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <App />
    </ThemeProvider>
  );
}

export function AppShell({ ssrData }: { ssrData: SsrPayload | null }) {
  return (
    <SsrDataProvider value={ssrData}>
      <ColorModeProvider>
        <ThemedApp />
      </ColorModeProvider>
    </SsrDataProvider>
  );
}
