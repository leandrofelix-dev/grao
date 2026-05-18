const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.82;
/** Abaixo disso e já JPEG, só recompacta se a maior borda passar do limite. */
const SMALL_FILE_BYTES = 350_000;

function isHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  );
}

function outputName(original: string): string {
  const base = original.replace(/\.[^.]+$/i, '') || 'foto';
  return `${base}.jpg`;
}

/**
 * Redimensiona e comprime no navegador antes do upload (menos tempo de envio).
 * HEIC segue cru — o servidor converte com heic-convert + sharp.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  if (isHeic(file)) return file;
  if (!file.type.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const longEdge = Math.max(width, height);

    if (
      longEdge <= MAX_EDGE &&
      file.size <= SMALL_FILE_BYTES &&
      file.type === 'image/jpeg'
    ) {
      bitmap.close();
      return file;
    }

    const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1;
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
    });
    if (!blob || blob.size >= file.size * 0.98) return file;

    return new File([blob], outputName(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
