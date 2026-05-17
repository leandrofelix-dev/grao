import type { PhotoView } from './photo-view.js';

export type AdminPhotoFilter = 'published' | 'archived' | 'all';

export interface AdminPhotoView extends PhotoView {
  archivedAt: string | null;
}

export interface AdminPhotosPage {
  items: AdminPhotoView[];
  nextCursor: string | null;
}
