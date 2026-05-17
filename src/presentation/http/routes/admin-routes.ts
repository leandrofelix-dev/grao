import type { FastifyInstance } from 'fastify';
import type { AppContainer } from '../../app/container.js';
import { AdminController } from '../controllers/admin-controller.js';
import { requireUploadAuth } from '../middleware/upload-auth.js';

export function registerAdminRoutes(
  app: FastifyInstance,
  container: AppContainer,
): void {
  const controller = new AdminController(container);
  const auth = { preHandler: requireUploadAuth };

  app.get(
    '/api/admin/photos',
    {
      ...auth,
      config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
    },
    controller.list,
  );

  app.patch(
    '/api/admin/photos/:id',
    {
      ...auth,
      config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
    },
    controller.patch,
  );

  app.delete(
    '/api/admin/photos/:id',
    {
      ...auth,
      config: { rateLimit: { max: 60, timeWindow: '1 hour' } },
    },
    controller.remove,
  );
}
