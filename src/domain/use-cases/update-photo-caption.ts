import type { AdminPhotoView } from '../dto/admin-photo-view.js';
import type { PhotoRepository } from '../repositories/photo-repository.js';

export class UpdatePhotoCaptionUseCase {
  constructor(private readonly photos: PhotoRepository) {}

  execute(id: string, caption: string | null): Promise<AdminPhotoView | null> {
    const trimmed = caption?.trim() ?? '';
    const value = trimmed.length > 0 ? trimmed : null;
    return this.photos.updateCaption(id, value);
  }
}
