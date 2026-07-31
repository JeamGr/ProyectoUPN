import { Router } from 'express';
import { DataSource } from 'typeorm';
import { MysqlInscripcionRepository } from '../infrastructure/MysqlInscripcionRepository';
import { InscripcionService } from '../application/InscripcionService';
import { InscripcionController } from './InscripcionController';

export const createInscripcionRouter = (dataSource: DataSource, authHandlerFactory: any): Router => {
    const router = Router();

    const repository = new MysqlInscripcionRepository(dataSource);
    const service = new InscripcionService(repository);
    const controller = new InscripcionController(service);

    // RF-026: solo VOLUNTARIO puede inscribirse
    router.post('/', authHandlerFactory({ roles: ['VOLUNTARIO'] }), controller.inscribirse);

    // RF-028 (Vista Voluntario): Obtener 'Mis Eventos' del voluntario logueado
    router.get('/mis-eventos', authHandlerFactory({ roles: ['VOLUNTARIO'] }), controller.obtenerMisInscripciones);

    // RF-027: solo VOLUNTARIO puede cancelar (y el Service valida que sea SU inscripción)
    router.delete('/:id', authHandlerFactory({ roles: ['VOLUNTARIO'] }), controller.cancelarInscripcion);

    // RF-031: solo ORGANIZACION aprueba/rechaza (y el Service valida que sea SU oportunidad)
    router.patch('/:id/aprobar', authHandlerFactory({ roles: ['ORGANIZACION'] }), controller.aprobarInscripcion);
    router.patch('/:id/rechazar', authHandlerFactory({ roles: ['ORGANIZACION'] }), controller.rechazarInscripcion);

    // RF-029 / RF-028 (consulta) / RF-030: solo ORGANIZACION, sobre sus propias oportunidades
    router.get(
        '/oportunidad/:oportunidadId',
        authHandlerFactory({ roles: ['ORGANIZACION'] }),
        controller.obtenerInscritos
    );
    router.get(
        '/oportunidad/:oportunidadId/lista-espera',
        authHandlerFactory({ roles: ['ORGANIZACION'] }),
        controller.obtenerListaEspera
    );
    router.get(
        '/oportunidad/:oportunidadId/exportar',
        authHandlerFactory({ roles: ['ORGANIZACION'] }),
        controller.exportarInscritos
    );

    return router;
};
