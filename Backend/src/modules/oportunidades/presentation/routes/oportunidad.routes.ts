import { Router } from 'express';
import { OportunidadController } from '../controllers/oportunidad.controller';
import { CrearOportunidadDTO } from '../../application/dtos/crear-oportunidad.dto';
import { RechazarOportunidadDTO } from '../../application/dtos/rechazar-oportunidad.dto';
import { authHandler } from '../../../../shared/middlewares/auth.handler';
import { uploadImagenOportunidad, manejarSubida } from '../../../../shared/middlewares/upload.middleware';
const router = Router();
const controller = new OportunidadController();

// ---- Públicas ----
router.get('/', controller.buscarPublicadas);
router.get('/:id', controller.obtenerPorId);

// ---- Solo VOLUNTARIO ----
router.get('/me/recomendadas', authHandler({ roles: ['VOLUNTARIO'] }), controller.buscarRecomendadas);

// ---- Solo ORGANIZACION ----
router.post('/', authHandler({ roles: ['ORGANIZACION'], dto: CrearOportunidadDTO }), controller.crear);
router.get('/me/mias', authHandler({ roles: ['ORGANIZACION'] }), controller.buscarMias);
router.post('/:id/enviar-revision', authHandler({ roles: ['ORGANIZACION'] }), controller.enviarARevision);
router.post('/:id/pausar', authHandler({ roles: ['ORGANIZACION'] }), controller.pausar);
router.post('/:id/reanudar', authHandler({ roles: ['ORGANIZACION'] }), controller.reanudar);
router.post('/:id/cerrar', authHandler({ roles: ['ORGANIZACION'] }), controller.cerrar);

// ---- Solo ADMINISTRADOR / SUPER_ADMINISTRADOR ----
router.post('/:id/aprobar', authHandler({ roles: ['ADMINISTRADOR', 'SUPER_ADMINISTRADOR'] }), controller.aprobar);
router.post('/:id/rechazar', authHandler({ roles: ['ADMINISTRADOR', 'SUPER_ADMINISTRADOR'], dto: RechazarOportunidadDTO }), controller.rechazar);
router.post('/:id/cancelar', authHandler({ roles: ['ADMINISTRADOR', 'SUPER_ADMINISTRADOR'], dto: RechazarOportunidadDTO }), controller.cancelar);

router.post('/:id/imagen', authHandler({ roles: ['ORGANIZACION'] }), manejarSubida(uploadImagenOportunidad, 'imagen'), controller.subirImagen);
router.get('/pendientes/aprobacion', authHandler({ roles: ['ADMINISTRADOR', 'SUPER_ADMINISTRADOR'] }), controller.listarPendientes);
router.get('/me/metricas', authHandler({ roles: ['ORGANIZACION'] }), controller.misMetricas);
export default router;