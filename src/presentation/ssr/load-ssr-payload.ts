import type { SsrPayload } from '../../domain/dto/photo-view.js';
import type { AppContainer } from '../app/container.js';

export async function loadSsrPayload(
  url: string,
  container: AppContainer,
): Promise<SsrPayload> {
  const pathname = url.split('?')[0] ?? '/';
  if (pathname === '/') {
    const feed = await container.listPhotos.execute(24);
    return { feed };
  }
  return {};
}
