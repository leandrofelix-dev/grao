import convert from 'heic-convert';
import { isHeicInput } from './image-mime.js';

/** Converte HEIC/HEIF para JPEG em memória (sem libheif do sistema). */
export async function toJpegBufferIfHeic(
  input: Buffer,
  mime: string,
  filename?: string,
): Promise<Buffer> {
  if (!isHeicInput(mime, filename)) {
    return input;
  }

  try {
    // heic-decode exige Uint8Array (ArrayBuffer quebra isHeic()).
    const output = await convert({
      buffer: new Uint8Array(input) as unknown as ArrayBufferLike,
      format: 'JPEG',
      quality: 0.92,
    });
    return Buffer.from(output);
  } catch {
    throw new Error(
      'Não foi possível converter HEIC. Verifique o arquivo ou tente exportar como JPEG.',
    );
  }
}
