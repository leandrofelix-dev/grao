import type {
  AdminPhotoFilter,
  AdminPhotoView,
  AdminPhotosPage,
} from '../../domain/dto/admin-photo-view.js';
import type { PhotoView, PhotosPage } from '../../domain/dto/photo-view.js';

const AUTH_KEY = 'grao-upload-token';

export function getUploadToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(AUTH_KEY);
}

export function setUploadToken(token: string): void {
  sessionStorage.setItem(AUTH_KEY, token);
}

export function clearUploadToken(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

function authHeaders(): HeadersInit {
  const token = getUploadToken();
  if (!token) throw new Error('Sessão expirada. Entre novamente.');
  return { Authorization: `Bearer ${token}` };
}

async function parseError(res: Response, fallback: string): Promise<never> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 401) clearUploadToken();
  throw new Error(body.error ?? fallback);
}

export async function verifyUploadPassword(password: string): Promise<void> {
  const res = await fetch('/api/upload/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${password}` },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Senha incorreta');
  }

  setUploadToken(password);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPhotos(
  cursor?: string,
  limit = 24,
): Promise<PhotosPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const url = `/api/photos?${params}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after'));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1000 * 2 ** attempt;
      await sleep(waitMs);
      continue;
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? 'Failed to load photos');
    }
    return res.json() as Promise<PhotosPage>;
  }

  throw new Error('Muitas requisições. Tente de novo em instantes.');
}

export async function fetchAdminPhotos(
  filter: AdminPhotoFilter,
  cursor?: string,
  limit = 24,
): Promise<AdminPhotosPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    filter,
  });
  if (cursor) params.set('cursor', cursor);

  const res = await fetch(`/api/admin/photos?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) await parseError(res, 'Não foi possível carregar as fotos.');
  return res.json() as Promise<AdminPhotosPage>;
}

export async function updatePhotoCaption(
  id: string,
  caption: string,
): Promise<AdminPhotoView> {
  const res = await fetch(`/api/admin/photos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption }),
  });
  if (!res.ok) await parseError(res, 'Não foi possível salvar a legenda.');
  return res.json() as Promise<AdminPhotoView>;
}

export async function setPhotoArchived(
  id: string,
  archived: boolean,
): Promise<AdminPhotoView> {
  const res = await fetch(`/api/admin/photos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ archived }),
  });
  if (!res.ok) await parseError(res, 'Não foi possível atualizar o arquivo.');
  return res.json() as Promise<AdminPhotoView>;
}

export async function deletePhoto(id: string): Promise<void> {
  const res = await fetch(`/api/admin/photos/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await parseError(res, 'Não foi possível excluir a foto.');
}

export async function uploadPhoto(
  file: File,
  caption: string,
  password: string,
): Promise<PhotoView> {
  const form = new FormData();
  form.append('file', file);
  if (caption.trim()) form.append('caption', caption.trim());

  const res = await fetch('/api/photos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${password}` },
    body: form,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Upload failed');
  }

  setUploadToken(password);
  return res.json() as Promise<PhotoView>;
}

export interface UploadBatchResult {
  uploaded: PhotoView[];
  failed: { index: number; name: string; error: string }[];
}

export async function uploadPhotos(
  files: File[],
  caption: string,
  password: string,
  onProgress?: (done: number, total: number) => void,
): Promise<UploadBatchResult> {
  const uploaded: PhotoView[] = [];
  const failed: UploadBatchResult['failed'] = [];
  const trimmedCaption = caption.trim();

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    try {
      uploaded.push(await uploadPhoto(file, trimmedCaption, password));
    } catch (err) {
      failed.push({
        index: i,
        name: file.name,
        error: err instanceof Error ? err.message : 'Erro no envio.',
      });
    }
    onProgress?.(i + 1, files.length);
  }

  if (uploaded.length === 0) {
    throw new Error(failed[0]?.error ?? 'Nenhuma foto foi enviada.');
  }

  return { uploaded, failed };
}
