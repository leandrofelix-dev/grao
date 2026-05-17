import type { ImageProcessor } from '../repositories/image-processor.js';
import type { PhotoRepository } from '../repositories/photo-repository.js';

export class DeletePhotoUseCase {
  constructor(
    private readonly photos: PhotoRepository,
    private readonly images: ImageProcessor,
  ) {}

  async execute(id: string): Promise<boolean> {
    const deleted = await this.photos.delete(id);
    if (!deleted) return false;
    await this.images.remove(deleted.displayPath, deleted.thumbPath);
    return true;
  }
}
