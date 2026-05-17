import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AppContainer } from '../../app/container.js';

export class PhotoController {
  constructor(private readonly container: AppContainer) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const { cursor, limit: limitStr } = request.query as {
      cursor?: string;
      limit?: string;
    };
    const limit = Number(limitStr) || 24;

    try {
      return await this.container.listPhotos.execute(limit, cursor);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Failed to list photos' });
    }
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const photo = await this.container.getPhoto.execute(id);
    if (!photo) return reply.status(404).send({ error: 'Not found' });
    return photo;
  };

  upload = async (request: FastifyRequest, reply: FastifyReply) => {
    let buffer: Buffer | null = null;
    let mime = '';
    let filename = '';
    let caption: string | null = null;

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        buffer = await part.toBuffer();
        mime = part.mimetype;
        filename = part.filename;
      } else if (part.fieldname === 'caption') {
        const value = await part.value;
        caption = String(value).trim() || null;
      }
    }

    if (!buffer || buffer.length === 0) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    try {
      const photo = await this.container.uploadPhoto.execute({
        buffer,
        mime,
        filename,
        caption,
      });
      return reply.status(201).send(photo);
    } catch (err) {
      request.log.error(err);
      const message = err instanceof Error ? err.message : 'Processing failed';
      return reply.status(400).send({ error: message });
    }
  };

}
