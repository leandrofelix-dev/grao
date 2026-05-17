import type { SsrPayload } from '../domain/dto/photo-view.js';

declare global {
  interface Window {
    __GRAO_DATA__?: SsrPayload;
  }
}

export {};
