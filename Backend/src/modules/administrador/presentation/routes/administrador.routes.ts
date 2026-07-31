import { Router } from 'express';
import { MetricasController } from '../controllers/metricas.controller';
import { authHandler } from '../../../../shared/middlewares/auth.handler';

const router = Router();
const controller = new MetricasController();

router.get('/metricas', authHandler({ roles: ['ADMINISTRADOR', 'SUPER_ADMINISTRADOR'] }), controller.obtenerGlobales);

export default router;