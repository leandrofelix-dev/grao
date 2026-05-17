import type { AdminPhotoView } from '../dto/admin-photo-view.js';
import type { PhotoRepository } from '../repositories/photo-repository.js';

export class SetPhotoArchivedUseCase {
  constructor(private readonly photos: PhotoRepository) {}

  execute(id: string, archived: boolean): Promise<AdminPhotoView | null> {
    return this.photos.setArchived(id, archived);
  }
}
