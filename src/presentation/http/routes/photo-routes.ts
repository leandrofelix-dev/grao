import type { FastifyInstance } from 'fastify';
import type { AppContainer } from '../../app/container.js';
import { PhotoController } from '../controllers/photo-controller.js';
import { UploadAuthController } from '../controllers/upload-auth-controller.js';
import { requireUploadAuth } from '../middleware/upload-auth.js';

export function registerPhotoRoutes(
  app: FastifyInstance,
  container: AppContainer,
): void {
  const controller = new PhotoController(container);
  const uploadAuth = new UploadAuthController();

  app.post(
    '/api/upload/verify',
    {
      config: {
        rateLimit: { max: 12, timeWindow: '15 minutes' },
      },
    },
    uploadAuth.verify,
  );

  app.get(
    '/api/photos',
    {
      config: {
        rateLimit: { max: 120, timeWindow: '1 minute' },
      },
    },
    controller.list,
  );
  app.get('/api/photos/:id', controller.getById);

  app.post(
    '/api/photos',
    {
      preHandler: requireUploadAuth,
      config: {
        rateLimit: { max: 60, timeWindow: '1 hour' },
      },
    },
    controller.upload,
  );

}
