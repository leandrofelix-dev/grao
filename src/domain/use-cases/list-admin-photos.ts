import type { AdminPhotoFilter, AdminPhotosPage } from '../dto/admin-photo-view.js';
import type { PhotoRepository } from '../repositories/photo-repository.js';

export class ListAdminPhotosUseCase {
  constructor(private readonly photos: PhotoRepository) {}

  execute(
    filter: AdminPhotoFilter,
    limit: number,
    cursor?: string,
  ): Promise<AdminPhotosPage> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    return this.photos.listAdmin(filter, safeLimit, cursor);
  }
}
