import { Router } from 'express';
import { RolPermisoController } from '../controllers/rol-permiso.controller';
import { RolPermisoService } from '../../application/services/rol-permiso.service';
import { RolAdminRepository } from '../../infrastructure/repositories/rol-admin.repository';
import { PermisoRepository } from '../../infrastructure/repositories/permiso.repository';
import { AsignarPermisoDTO, ActualizarRolDTO } from '../../application/dtos/rol-permiso.dto';
import { authHandler } from '../../../../shared/middlewares/auth.handler';

// A diferencia de RF-057/RF-058, la Sección 22 (matriz de permisos) del
// SRS reserva "Roles y permisos" EXCLUSIVAMENTE al Super Administrador
// (RN: "el Super Administrador... posee acceso exclusivo a la gestión
// de roles y permisos"), por eso aquí NO se incluye 'ADMINISTRADOR'.
const ROLES_SUPER_ADMIN = ['SUPER_ADMINISTRADOR'] as const;

export function crearRolPermisoRouter(): Router {
    const router = Router();
    const rolRepository = new RolAdminRepository();
    const permisoRepository = new PermisoRepository();
    const service = new RolPermisoService(rolRepository, permisoRepository);
    const controller = new RolPermisoController(service);

    // Roles: no se crean ni se eliminan (están atados al tipo Rol fijo
    // usado por el JWT/authHandler), solo se listan y se edita su
    // descripción.
    router.get('/', authHandler({ roles: [...ROLES_SUPER_ADMIN] }), controller.listarRoles);
    router.put('/:rolId', authHandler({ roles: [...ROLES_SUPER_ADMIN], dto: ActualizarRolDTO }), controller.actualizarRol);

    // Permisos granulares por rol (módulo + acción).
    router.get('/:rolId/permisos', authHandler({ roles: [...ROLES_SUPER_ADMIN] }), controller.listarPermisos);
    router.post('/:rolId/permisos', authHandler({ roles: [...ROLES_SUPER_ADMIN], dto: AsignarPermisoDTO }), controller.asignarPermiso);
    router.delete('/:rolId/permisos/:modulo/:accion', authHandler({ roles: [...ROLES_SUPER_ADMIN] }), controller.quitarPermiso);

    return router;
}
