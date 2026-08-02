import { Router } from 'express';
import { DataSource } from 'typeorm';
import { MysqlPerfilRepository } from '../infrastructure/MysqlPerfilRepository';
import { PerfilService } from '../application/PerfilService';
import { PerfilController } from './PerfilController';
import { uploadFotoPerfil, manejarSubida } from '../../../shared/middlewares/upload.middleware';

export const createPerfilRouter = (dataSource: DataSource, authMiddleware: any): Router => {
    const router = Router();

    const repository = new MysqlPerfilRepository(dataSource);
    const service = new PerfilService(repository);
    const controller = new PerfilController(service);

    router.use(authMiddleware);

    // Rutas de Voluntario
    router.get('/voluntario/me', controller.obtenerPerfilVoluntario);
    router.put('/voluntario/me', controller.actualizarPerfilVoluntario);
    // NUEVO — RF-012: subida real de la foto de perfil
    router.post('/voluntario/me/foto', manejarSubida(uploadFotoPerfil, 'foto'), controller.subirFotoVoluntario);

    // Rutas de Organización
    router.get('/organizacion/me', controller.obtenerPerfilOrganizacion);
    router.put('/organizacion/me', controller.actualizarPerfilOrganizacion);

    // Rutas de Preferencias
    router.get('/preferencias', controller.obtenerPreferencias);
    router.put('/preferencias', controller.actualizarPreferencias);

    // Ruta de Baja Lógica (RF-013)
    router.delete('/me', controller.darDeBajaCuenta);

    return router;
};