import type { Photo } from '../../domain/entities/photo.js';
import type {
  AdminPhotoFilter,
  AdminPhotoView,
  AdminPhotosPage,
} from '../../domain/dto/admin-photo-view.js';
import type { PhotoRepository } from '../../domain/repositories/photo-repository.js';
import type { PhotoView, PhotosPage } from '../../domain/dto/photo-view.js';
import { pool } from './pool.js';

interface PhotoRow {
  id: string;
  caption: string | null;
  display_path: string;
  thumb_path: string;
  width: number;
  height: number;
  created_at: Date;
  archived_at: Date | null;
}

function toView(row: PhotoRow): PhotoView {
  return {
    id: row.id,
    caption: row.caption,
    width: row.width,
    height: row.height,
    createdAt: row.created_at.toISOString(),
    displayUrl: `/uploads/${row.display_path}`,
    thumbUrl: `/uploads/${row.thumb_path}`,
  };
}

function toAdminView(row: PhotoRow): AdminPhotoView {
  return {
    ...toView(row),
    archivedAt: row.archived_at?.toISOString() ?? null,
  };
}

function filterClause(filter: AdminPhotoFilter): string {
  if (filter === 'published') return 'WHERE archived_at IS NULL';
  if (filter === 'archived') return 'WHERE archived_at IS NOT NULL';
  return '';
}

export class PgPhotoRepository implements PhotoRepository {
  async list(limit: number, cursor?: string): Promise<PhotosPage> {
    return this.listFiltered('WHERE archived_at IS NULL', limit, cursor, toView);
  }

  async listAdmin(
    filter: AdminPhotoFilter,
    limit: number,
    cursor?: string,
  ): Promise<AdminPhotosPage> {
    return this.listFiltered(filterClause(filter), limit, cursor, toAdminView);
  }

  private async listFiltered<T extends PhotoView>(
    whereBase: string,
    limit: number,
    cursor: string | undefined,
    mapRow: (row: PhotoRow) => T,
  ): Promise<{ items: T[]; nextCursor: string | null }> {
    const params: unknown[] = [];
    let where = whereBase;

    if (cursor) {
      const [createdAt, id] = decodeCursor(cursor);
      const cursorClause = `(created_at, id) < ($${params.length + 1}::timestamptz, $${params.length + 2}::uuid)`;
      params.push(createdAt, id);
      where = where
        ? `${where} AND ${cursorClause}`
        : `WHERE ${cursorClause}`;
    }

    const query = `
      SELECT id, caption, display_path, thumb_path, width, height, created_at, archived_at
      FROM photos
      ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit + 1);

    const { rows } = await pool.query<PhotoRow>(query, params);
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const items = slice.map(mapRow);

    let nextCursor: string | null = null;
    if (hasMore && slice.length > 0) {
      const last = slice[slice.length - 1]!;
      nextCursor = encodeCursor(last.created_at, last.id);
    }

    return { items, nextCursor };
  }

  async findById(id: string): Promise<PhotoView | null> {
    const { rows } = await pool.query<PhotoRow>(
      `SELECT id, caption, display_path, thumb_path, width, height, created_at, archived_at
       FROM photos WHERE id = $1 AND archived_at IS NULL`,
      [id],
    );
    if (rows.length === 0) return null;
    return toView(rows[0]!);
  }

  async save(photo: Photo): Promise<PhotoView> {
    const { rows } = await pool.query<PhotoRow>(
      `INSERT INTO photos (id, caption, display_path, thumb_path, width, height)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, caption, display_path, thumb_path, width, height, created_at, archived_at`,
      [
        photo.id,
        photo.caption,
        photo.displayPath,
        photo.thumbPath,
        photo.width,
        photo.height,
      ],
    );
    return toView(rows[0]!);
  }

  async updateCaption(
    id: string,
    caption: string | null,
  ): Promise<AdminPhotoView | null> {
    const { rows } = await pool.query<PhotoRow>(
      `UPDATE photos SET caption = $2 WHERE id = $1
       RETURNING id, caption, display_path, thumb_path, width, height, created_at, archived_at`,
      [id, caption],
    );
    if (rows.length === 0) return null;
    return toAdminView(rows[0]!);
  }

  async setArchived(id: string, archived: boolean): Promise<AdminPhotoView | null> {
    const { rows } = await pool.query<PhotoRow>(
      `UPDATE photos
       SET archived_at = CASE WHEN $2 THEN COALESCE(archived_at, now()) ELSE NULL END
       WHERE id = $1
       RETURNING id, caption, display_path, thumb_path, width, height, created_at, archived_at`,
      [id, archived],
    );
    if (rows.length === 0) return null;
    return toAdminView(rows[0]!);
  }

  async delete(
    id: string,
  ): Promise<{ displayPath: string; thumbPath: string } | null> {
    const { rows } = await pool.query<PhotoRow>(
      `DELETE FROM photos WHERE id = $1
       RETURNING display_path, thumb_path`,
      [id],
    );
    if (rows.length === 0) return null;
    return {
      displayPath: rows[0]!.display_path,
      thumbPath: rows[0]!.thumb_path,
    };
  }
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString('base64url');
}

function decodeCursor(cursor: string): [string, string] {
  const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
  const [createdAt, id] = decoded.split('|');
  if (!createdAt || !id) throw new Error('Invalid cursor');
  return [createdAt, id];
}
