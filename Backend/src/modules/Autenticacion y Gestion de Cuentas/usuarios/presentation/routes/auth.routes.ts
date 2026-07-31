import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { RegistroVoluntarioDTO } from '../../application/dtos/registro-voluntario.dto';
import { VerificarCodigoDTO } from '../../application/dtos/verificar-codigo.dto';
import { ReenviarCodigoDTO } from '../../application/dtos/reenviar-codigo.dto';
import { validateBody } from '../../../../../shared/middlewares/validate-body.middleware';
import { SolicitarRecuperacionDTO } from '../../application/dtos/solicitar-recuperacion.dto';
import { ConfirmarRecuperacionDTO } from '../../application/dtos/confirmar-recuperacion.dto';
import { LoginDTO } from '../../application/dtos/login.dto';
import { LoginGoogleDTO } from '../../application/dtos/login-google.dto';
import { authHandler } from '../../../../../shared/middlewares/auth.handler';

const router = Router();
const controller = new AuthController();

router.post('/google', validateBody(LoginGoogleDTO), controller.loginGoogle);
router.post('/logout', authHandler({}), controller.logout);
router.post('/registro', validateBody(RegistroVoluntarioDTO), controller.registrar);
router.post('/verificar-codigo', validateBody(VerificarCodigoDTO), controller.verificarCodigo);
router.post('/reenviar-codigo', validateBody(ReenviarCodigoDTO), controller.reenviarCodigo);
router.post('/recuperar-password', validateBody(SolicitarRecuperacionDTO), controller.solicitarRecuperacion);
router.post('/restablecer-password', validateBody(ConfirmarRecuperacionDTO), controller.confirmarRecuperacion);
router.post('/login', validateBody(LoginDTO), controller.login);

export default router;