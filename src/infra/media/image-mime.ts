const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

function isHeicFilename(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.endsWith('.heic') || lower.endsWith('.heif');
}

export function isHeicInput(mime: string, filename?: string): boolean {
  const normalized = mime.toLowerCase().split(';')[0]!.trim();
  if (filename && isHeicFilename(filename)) return true;
  return (
    normalized === 'image/heic' ||
    normalized === 'image/heif' ||
    normalized === 'image/heic-sequence' ||
    normalized === 'image/heif-sequence'
  );
}

export function resolveImageMime(mime: string, filename?: string): string {
  const normalized = mime.toLowerCase().split(';')[0]!.trim();

  if (filename && isHeicFilename(filename)) {
    return 'image/heic';
  }

  if (ALLOWED_MIMES.has(normalized)) {
    return normalized;
  }

  if (normalized === '' || normalized === 'application/octet-stream') {
    throw new Error(
      'Formato não suportado. Use JPEG, PNG, WebP ou HEIC.',
    );
  }

  throw new Error(
    'Formato não suportado. Use JPEG, PNG, WebP ou HEIC.',
  );
}
