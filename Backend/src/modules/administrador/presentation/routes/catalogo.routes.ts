import { Router } from 'express';
import { CatalogoController } from '../controllers/catalogo.controller';
import { CatalogoService } from '../../application/services/catalogo.service';
import { CatalogoRepository } from '../../infrastructure/repositories/catalogo.repository';
import { CrearItemCatalogoDTO, ActualizarItemCatalogoDTO } from '../../application/dtos/catalogo.dto';
import { TipoCatalogo } from '../../domain/entities/ItemCatalogo';
import { authHandler } from '../../../../shared/middlewares/auth.handler';

const ROLES_ADMIN = ['ADMINISTRADOR', 'SUPER_ADMINISTRADOR'] as const;

// Un router por catálogo (lineas-intervencion, categorias-organizacion,
// ubicaciones). Los 3 comparten el mismo service/repository: solo cambia
// el "tipo" con el que se instancia el controller, en main.ts.
export function crearCatalogoRouter(tipo: TipoCatalogo): Router {
    const router = Router();
    const repository = new CatalogoRepository();
    const service = new CatalogoService(repository);
    const controller = new CatalogoController(tipo, service);

    // Lectura pública: el formulario de registro de organización (RF-002)
    // y el de creación de oportunidades (RF-014) necesitan poblar estos
    // combos sin que el usuario haya iniciado sesión todavía.
    router.get('/', controller.listar);

    // Escritura: solo Administrador / Super Administrador (RF-057).
    router.post('/', authHandler({ roles: [...ROLES_ADMIN], dto: CrearItemCatalogoDTO }), controller.crear);
    router.put('/:id', authHandler({ roles: [...ROLES_ADMIN], dto: ActualizarItemCatalogoDTO }), controller.actualizar);
    router.patch('/:id/activar', authHandler({ roles: [...ROLES_ADMIN] }), controller.activar);
    router.patch('/:id/desactivar', authHandler({ roles: [...ROLES_ADMIN] }), controller.desactivar);

    return router;
}
