export interface ProcessedImage {
  id: string;
  displayRel: string;
  thumbRel: string;
  width: number;
  height: number;
}

export interface ImageProcessor {
  process(
    buffer: Buffer,
    mime: string,
    filename?: string,
  ): Promise<ProcessedImage>;
  remove(displayRel: string, thumbRel: string): Promise<void>;
}
