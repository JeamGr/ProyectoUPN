// =================================================================
// CAPA: Presentation / Routes
// Rutas públicas del módulo Usuarios (sin JWT, aún no existe sesión).
//
//   POST /auth/registro
//   POST /auth/verificar-codigo
//   POST /auth/reenviar-codigo
// =================================================================
import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { RegistroDTO } from '../../application/dtos/registro.dto';
import { VerificarCodigoDTO } from '../../application/dtos/verificar-codigo.dto';
import { ReenviarCodigoDTO } from '../../application/dtos/reenviar-codigo.dto';
import { validateBody } from '../../../../shared/middlewares/validate-body.middleware';

const router = Router();
const controller = new AuthController();

router.post('/registro', validateBody(RegistroDTO), controller.registrar);
router.post('/verificar-codigo', validateBody(VerificarCodigoDTO), controller.verificarCodigo);
router.post('/reenviar-codigo', validateBody(ReenviarCodigoDTO), controller.reenviarCodigo);

export default router;