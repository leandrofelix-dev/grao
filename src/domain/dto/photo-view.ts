export interface PhotoView {
  id: string;
  caption: string | null;
  width: number;
  height: number;
  createdAt: string;
  displayUrl: string;
  thumbUrl: string;
}

export interface PhotosPage {
  items: PhotoView[];
  nextCursor: string | null;
}

export interface SsrPayload {
  feed?: PhotosPage;
}
