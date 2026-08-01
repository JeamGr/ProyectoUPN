import { Router } from 'express';
import { AsistenciaController } from '../controllers/asistencia.controller';
import { RegistrarAsistenciaDTO } from '../../application/dtos/registrar-asistencia.dto';
import { SubirEvidenciaDTO } from '../../application/dtos/subir-evidencia.dto';
import { ReportarIncidenciaDTO } from '../../application/dtos/reportar-incidencia.dto';
import { ActualizarEstadoIncidenciaDTO } from '../../application/dtos/actualizar-estado-incidencia.dto';
import { authHandler } from '../../../../shared/middlewares/auth.handler';
import { uploadEvidencia } from '../../../../shared/middlewares/upload.middleware';

const router = Router();
const controller = new AsistenciaController();

// ---- Asistencia (solo Organización) ----
router.post('/', authHandler({ roles: ['ORGANIZACION'], dto: RegistrarAsistenciaDTO }), controller.registrarAsistencia);
router.get('/oportunidad/:oportunidadId', authHandler({ roles: ['ORGANIZACION'] }), controller.listarAsistenciaPorOportunidad);
router.get('/mis-horas', authHandler({ roles: ['VOLUNTARIO'] }), controller.misHorasAcumuladas);

// ---- Evidencias ----
router.post(
    '/evidencias/:inscripcionId',
    authHandler({ roles: ['ORGANIZACION'] }),
    (req, res, next) => { req.body.inscripcionId = Number(req.params.inscripcionId); next(); },
    uploadEvidencia.single('archivo'),
    (req, res, next) => { /* validateBody manual porque multer ya consumió el body como multipart */
        const dto = new SubirEvidenciaDTO();
        Object.assign(dto, req.body);
        // multer entrega todo como string; sin esta conversión, inscripcionId
        // llega como texto y contenidoSensible === 'false' se guardaría como
        // "truthy" en la base de datos.
        dto.inscripcionId = Number(req.params.inscripcionId);
        dto.contenidoSensible = req.body.contenidoSensible === 'true';
        req.dto = dto;
        next();
    },
    controller.subirEvidencia,
);
router.get('/evidencias/oportunidad/:oportunidadId/publica', controller.galeriaPublica); // RF-035: publico
router.get('/evidencias/oportunidad/:oportunidadId/completa', authHandler({ roles: ['ORGANIZACION'] }), controller.galeriaCompleta);

// ---- Incidencias ----
router.post('/incidencias', authHandler({ roles: ['VOLUNTARIO', 'ORGANIZACION'], dto: ReportarIncidenciaDTO }), controller.reportarIncidencia);
router.get('/incidencias/oportunidad/:oportunidadId', authHandler({ roles: ['ORGANIZACION', 'ADMINISTRADOR', 'SUPER_ADMINISTRADOR'] }), controller.listarIncidencias);
router.patch(
    '/incidencias/:id/estado',
    authHandler({ roles: ['ORGANIZACION', 'ADMINISTRADOR', 'SUPER_ADMINISTRADOR'], dto: ActualizarEstadoIncidenciaDTO }),
    controller.actualizarEstadoIncidencia,
);
router.get('/inscritos/:oportunidadId', authHandler({ roles: ['ORGANIZACION'] }), controller.listarInscritos);
export default router;