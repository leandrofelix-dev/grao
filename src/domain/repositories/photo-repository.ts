import type { Photo } from '../entities/photo.js';
import type {
  AdminPhotoFilter,
  AdminPhotoView,
  AdminPhotosPage,
} from '../dto/admin-photo-view.js';
import type { PhotoView, PhotosPage } from '../dto/photo-view.js';

export interface PhotoRepository {
  list(limit: number, cursor?: string): Promise<PhotosPage>;
  listAdmin(
    filter: AdminPhotoFilter,
    limit: number,
    cursor?: string,
  ): Promise<AdminPhotosPage>;
  findById(id: string): Promise<PhotoView | null>;
  save(photo: Photo): Promise<PhotoView>;
  updateCaption(id: string, caption: string | null): Promise<AdminPhotoView | null>;
  setArchived(id: string, archived: boolean): Promise<AdminPhotoView | null>;
  delete(id: string): Promise<{ displayPath: string; thumbPath: string } | null>;
}
