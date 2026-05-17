import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  AdminPhotoFilter,
  AdminPhotoView,
} from '../../../domain/dto/admin-photo-view.js';
import type { AppContainer } from '../../app/container.js';

const FILTERS = new Set<AdminPhotoFilter>(['published', 'archived', 'all']);

export class AdminController {
  constructor(private readonly container: AppContainer) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const { cursor, limit: limitStr, filter: filterStr } = request.query as {
      cursor?: string;
      limit?: string;
      filter?: string;
    };
    const limit = Number(limitStr) || 24;
    const filter: AdminPhotoFilter = FILTERS.has(filterStr as AdminPhotoFilter)
      ? (filterStr as AdminPhotoFilter)
      : 'published';

    try {
      return await this.container.listAdminPhotos.execute(filter, limit, cursor);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Failed to list photos' });
    }
  };

  patch = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      caption?: string | null;
      archived?: boolean;
    };

    if (body.caption === undefined && body.archived === undefined) {
      return reply.status(400).send({ error: 'Nothing to update' });
    }

    let updated: AdminPhotoView | null = null;

    if (body.caption !== undefined) {
      updated = await this.container.updatePhotoCaption.execute(id, body.caption);
      if (!updated) return reply.status(404).send({ error: 'Not found' });
    }

    if (body.archived !== undefined) {
      updated = await this.container.setPhotoArchived.execute(id, body.archived);
      if (!updated) return reply.status(404).send({ error: 'Not found' });
    }

    return updated;
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const deleted = await this.container.deletePhoto.execute(id);
    if (!deleted) return reply.status(404).send({ error: 'Not found' });
    return { ok: true };
  };
}
