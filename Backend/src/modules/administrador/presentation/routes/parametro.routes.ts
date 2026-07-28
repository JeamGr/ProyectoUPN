import { Router } from 'express';
import { ParametroController } from '../controllers/parametro.controller';
import { ParametroService } from '../../application/services/parametro.service';
import { ParametroRepository } from '../../infrastructure/repositories/parametro.repository';
import { GuardarParametroDTO } from '../../application/dtos/parametro.dto';
import { authHandler } from '../../../../shared/middlewares/auth.handler';

const ROLES_ADMIN = ['ADMINISTRADOR', 'SUPER_ADMINISTRADOR'] as const;

export function crearParametroRouter(): Router {
    const router = Router();
    const repository = new ParametroRepository();
    const service = new ParametroService(repository);
    const controller = new ParametroController(service);

    // RF-058: a diferencia de los catálogos (RF-057), aquí NO hay lectura
    // pública — son parámetros operativos internos (plazos, límites,
    // tiempos de expiración), exclusivos de Administrador/Super Admin.
    router.get('/', authHandler({ roles: [...ROLES_ADMIN] }), controller.listar);
    router.get('/:clave', authHandler({ roles: [...ROLES_ADMIN] }), controller.obtener);
    router.put('/:clave', authHandler({ roles: [...ROLES_ADMIN], dto: GuardarParametroDTO }), controller.guardar);

    return router;
}
