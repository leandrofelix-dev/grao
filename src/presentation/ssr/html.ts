import type { SsrPayload } from '../../domain/dto/photo-view.js';

export function buildHtml(
  template: string,
  html: string,
  styles: string,
  ssrData: SsrPayload,
): string {
  const dataScript = `<script>window.__GRAO_DATA__=${JSON.stringify(ssrData).replace(/</g, '\\u003c')}</script>`;
  return template
    .replace('<!--ssr-outlet-->', html)
    .replace('<!--ssr-styles-->', styles)
    .replace('<!--ssr-data-->', dataScript);
}
