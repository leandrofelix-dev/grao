import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import exifr from 'exifr';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type {
  ImageProcessor,
  ProcessedImage,
} from '../../domain/repositories/image-processor.js';
import { env } from '../config/env.js';
import { toJpegBufferIfHeic } from './heic-decode.js';
import { resolveImageMime } from './image-mime.js';

/** Feed em até ~1120px; 1600 cobre retina no viewer. */
const DISPLAY_MAX = 1600;
const THUMB_WIDTH = 480;
const DISPLAY_JPEG_QUALITY = 80;
const THUMB_JPEG_QUALITY = 76;

async function assertNoSensitiveMetadata(buffer: Buffer): Promise<void> {
  const gps = await exifr.gps(buffer);
  if (gps) {
    throw new Error('GPS metadata still present after processing');
  }

  const parsed = await exifr.parse(buffer);
  if (!parsed) return;

  const keys = Object.keys(parsed);
  const blocked = keys.filter((k) =>
    /gps|location|latitude|longitude|make|model|serial|software/i.test(k),
  );
  if (blocked.length > 0) {
    throw new Error(
      `Metadata still present after processing: ${blocked.join(', ')}`,
    );
  }
}

async function encodeVariant(
  input: Buffer,
  width: number,
  outputPath: string,
  quality: number,
): Promise<{ width: number; height: number }> {
  const pipeline = sharp(input)
    .rotate()
    .resize({
      width,
      fit: 'inside',
      withoutEnlargement: true,
    });

  const { data, info } = await pipeline
    .jpeg({
      quality,
      mozjpeg: true,
      progressive: true,
      chromaSubsampling: '4:2:0',
    })
    .toBuffer({ resolveWithObject: true });

  await writeFile(outputPath, data);
  await assertNoSensitiveMetadata(data);

  return { width: info.width, height: info.height };
}

export class SharpImageProcessor implements ImageProcessor {
  async process(
    input: Buffer,
    mime: string,
    filename?: string,
  ): Promise<ProcessedImage> {
    resolveImageMime(mime, filename);
    const raster = await toJpegBufferIfHeic(input, mime, filename);

    const id = uuidv4();
    const displayDir = join(env.uploadsDir, 'display');
    const thumbDir = join(env.uploadsDir, 'thumb');
    await mkdir(displayDir, { recursive: true });
    await mkdir(thumbDir, { recursive: true });

    const displayPath = join(displayDir, `${id}.jpg`);
    const thumbPath = join(thumbDir, `${id}.jpg`);

    const display = await encodeVariant(
      raster,
      DISPLAY_MAX,
      displayPath,
      DISPLAY_JPEG_QUALITY,
    );
    await encodeVariant(raster, THUMB_WIDTH, thumbPath, THUMB_JPEG_QUALITY);

    return {
      id,
      displayRel: `display/${id}.jpg`,
      thumbRel: `thumb/${id}.jpg`,
      width: display.width,
      height: display.height,
    };
  }

  async remove(displayRel: string, thumbRel: string): Promise<void> {
    await Promise.allSettled([
      unlink(join(env.uploadsDir, displayRel)),
      unlink(join(env.uploadsDir, thumbRel)),
    ]);
  }
}
