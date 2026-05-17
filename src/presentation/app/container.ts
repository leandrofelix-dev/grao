import { DeletePhotoUseCase } from '../../domain/use-cases/delete-photo.js';
import { GetPhotoUseCase } from '../../domain/use-cases/get-photo.js';
import { ListAdminPhotosUseCase } from '../../domain/use-cases/list-admin-photos.js';
import { ListPhotosUseCase } from '../../domain/use-cases/list-photos.js';
import { SetPhotoArchivedUseCase } from '../../domain/use-cases/set-photo-archived.js';
import { UpdatePhotoCaptionUseCase } from '../../domain/use-cases/update-photo-caption.js';
import { UploadPhotoUseCase } from '../../domain/use-cases/upload-photo.js';
import { PgPhotoRepository } from '../../infra/persistence/pg-photo-repository.js';
import { SharpImageProcessor } from '../../infra/media/sharp-image-processor.js';

export function createContainer() {
  const photoRepository = new PgPhotoRepository();
  const imageProcessor = new SharpImageProcessor();

  return {
    listPhotos: new ListPhotosUseCase(photoRepository),
    listAdminPhotos: new ListAdminPhotosUseCase(photoRepository),
    getPhoto: new GetPhotoUseCase(photoRepository),
    uploadPhoto: new UploadPhotoUseCase(photoRepository, imageProcessor),
    updatePhotoCaption: new UpdatePhotoCaptionUseCase(photoRepository),
    setPhotoArchived: new SetPhotoArchivedUseCase(photoRepository),
    deletePhoto: new DeletePhotoUseCase(photoRepository, imageProcessor),
  };
}

export type AppContainer = ReturnType<typeof createContainer>;
