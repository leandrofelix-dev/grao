import { isHeicFile } from './image-file.js';

const PREVIEW_MAX_EDGE = 320;
const HEIC_PREVIEW_QUALITY = 0.75;

async function bitmapToPreviewUrl(bitmap: ImageBitmap): Promise<string> {
  const longEdge = Math.max(bitmap.width, bitmap.height);
  const scale =
    longEdge > PREVIEW_MAX_EDGE ? PREVIEW_MAX_EDGE / longEdge : 1;
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    bitmap.close();
    return '';
  }

  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });
  return blob ? URL.createObjectURL(blob) : '';
}

async function heicToPreviewUrl(file: File): Promise<string> {
  try {
    const heic2any = (await import('heic2any')).default;
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: HEIC_PREVIEW_QUALITY,
    });
    const blob = (Array.isArray(converted) ? converted[0] : converted) as
      | Blob
      | undefined;
    if (!blob) return '';

    const bitmap = await createImageBitmap(blob);
    return bitmapToPreviewUrl(bitmap);
  } catch {
    return '';
  }
}

/** URL para miniatura no admin; HEIC é convertido porque o browser não exibe HEIC em <img>. */
export async function createPreviewUrl(file: File): Promise<string> {
  if (!isHeicFile(file)) {
    return URL.createObjectURL(file);
  }

  try {
    const bitmap = await createImageBitmap(file);
    return bitmapToPreviewUrl(bitmap);
  } catch {
    return heicToPreviewUrl(file);
  }
}
