import type { PhotoRepository } from '../repositories/photo-repository.js';
import type { PhotoView } from '../dto/photo-view.js';

export class GetPhotoUseCase {
  constructor(private readonly photos: PhotoRepository) {}

  execute(id: string): Promise<PhotoView | null> {
    return this.photos.findById(id);
  }
}
