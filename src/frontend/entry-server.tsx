import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { ServerStyleSheet } from 'styled-components';
import type { SsrPayload } from '../domain/dto/photo-view.js';
import { AppShell } from './AppShell.js';

export function renderPage(url: string, ssrData: SsrPayload) {
  const sheet = new ServerStyleSheet();
  try {
    const html = renderToString(
      sheet.collectStyles(
        <StaticRouter location={url}>
          <AppShell ssrData={ssrData} />
        </StaticRouter>,
      ),
    );
    return { html, styles: sheet.getStyleTags() };
  } finally {
    sheet.seal();
  }
}
