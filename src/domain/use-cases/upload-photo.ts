import type { Photo } from '../entities/photo.js';
import type { ImageProcessor } from '../repositories/image-processor.js';
import type { PhotoRepository } from '../repositories/photo-repository.js';
import type { PhotoView } from '../dto/photo-view.js';

export interface UploadPhotoInput {
  buffer: Buffer;
  mime: string;
  filename?: string;
  caption: string | null;
}

export class UploadPhotoUseCase {
  constructor(
    private readonly photos: PhotoRepository,
    private readonly images: ImageProcessor,
  ) {}

  async execute(input: UploadPhotoInput): Promise<PhotoView> {
    const processed = await this.images.process(
      input.buffer,
      input.mime,
      input.filename,
    );

    const photo: Photo = {
      id: processed.id,
      caption: input.caption,
      displayPath: processed.displayRel,
      thumbPath: processed.thumbRel,
      width: processed.width,
      height: processed.height,
    };

    try {
      return await this.photos.save(photo);
    } catch (err) {
      await this.images.remove(processed.displayRel, processed.thumbRel);
      throw err;
    }
  }
}
