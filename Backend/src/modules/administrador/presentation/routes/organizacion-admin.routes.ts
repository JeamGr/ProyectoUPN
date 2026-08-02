import { Router } from 'express';
import { OrganizacionAdminController } from '../controllers/organizacion-admin.controller';
import { OrganizacionAdminService } from '../../application/services/organizacion-admin.service';
import { OrganizacionAdminRepository } from '../../infrastructure/repositories/organizacion-admin.repository';
import { RechazarOrganizacionDTO } from '../../application/dtos/moderar-organizacion.dto';
import { MailerService } from '../../../notificaciones/application/services/mailer.service';
import { authHandler } from '../../../../shared/middlewares/auth.handler';

const ROLES_ADMIN = ['ADMINISTRADOR', 'SUPER_ADMINISTRADOR'] as const;

export function crearOrganizacionAdminRouter(): Router {
    const router = Router();
    const repository = new OrganizacionAdminRepository();
    const service = new OrganizacionAdminService(repository, new MailerService());
    const controller = new OrganizacionAdminController(service);

    // IMPORTANTE: '/resumen' va ANTES de '/:id', si no Express interpreta
    // "resumen" como un id y la ruta nunca se alcanza.
    router.get('/resumen', authHandler({ roles: [...ROLES_ADMIN] }), controller.resumen);
    router.get('/', authHandler({ roles: [...ROLES_ADMIN] }), controller.listar);
    router.get('/:id', authHandler({ roles: [...ROLES_ADMIN] }), controller.obtener);

    router.post('/:id/aprobar', authHandler({ roles: [...ROLES_ADMIN] }), controller.aprobar);
    router.post(
        '/:id/rechazar',
        authHandler({ roles: [...ROLES_ADMIN], dto: RechazarOrganizacionDTO }),
        controller.rechazar,
    );

    return router;
}