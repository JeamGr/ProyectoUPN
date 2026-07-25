import { Router } from 'express';
import { OrganizacionController } from '../controllers/organizacion.controller';
import { RegistroOrganizacionDTO } from '../../application/dtos/registro-organizacion.dto';
import { validateBody } from '../../../../../shared/middlewares/validate-body.middleware';

const router = Router();
const controller = new OrganizacionController();

router.post('/registro', validateBody(RegistroOrganizacionDTO), controller.registrar);

export default router;