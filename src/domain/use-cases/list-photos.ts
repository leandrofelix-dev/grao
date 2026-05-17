import type { PhotoRepository } from '../repositories/photo-repository.js';
import type { PhotosPage } from '../dto/photo-view.js';

export class ListPhotosUseCase {
  constructor(private readonly photos: PhotoRepository) {}

  execute(limit: number, cursor?: string): Promise<PhotosPage> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    return this.photos.list(safeLimit, cursor);
  }
}
