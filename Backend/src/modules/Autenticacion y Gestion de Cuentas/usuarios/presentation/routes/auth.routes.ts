import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { RegistroVoluntarioDTO } from '../../application/dtos/registro-voluntario.dto';
import { VerificarCodigoDTO } from '../../application/dtos/verificar-codigo.dto';
import { ReenviarCodigoDTO } from '../../application/dtos/reenviar-codigo.dto';
import { validateBody } from '../../../../../shared/middlewares/validate-body.middleware';

const router = Router();
const controller = new AuthController();

router.post('/registro', validateBody(RegistroVoluntarioDTO), controller.registrar);
router.post('/verificar-codigo', validateBody(VerificarCodigoDTO), controller.verificarCodigo);
router.post('/reenviar-codigo', validateBody(ReenviarCodigoDTO), controller.reenviarCodigo);

export default router;