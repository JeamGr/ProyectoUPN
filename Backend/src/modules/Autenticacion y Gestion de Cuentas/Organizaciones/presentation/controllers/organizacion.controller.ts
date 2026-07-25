import { Request, Response } from 'express';

import { RegistroOrganizacionDTO } from '../../application/dtos/registro-organizacion.dto';
import { RegistroOrganizacionService } from '../../application/services/registro-organizacion.service';

import { UsuarioRepository } from '../../../usuarios/infrastructure/repositories/usuario.repository';
import { RolRepository } from '../../../usuarios/infrastructure/repositories/rol.repository';
import { CodigoVerificacionRepository } from '../../../usuarios/infrastructure/repositories/codigo-verificacion.repository';
import { VerificacionService } from '../../../usuarios/application/services/verificacion.service';
import { MailerService } from '../../../../notificaciones/application/services/mailer.service';

import { OrganizacionRepository } from '../../infrastructure/repositories/organizacion.repository';

export class OrganizacionController {
    private registroService: RegistroOrganizacionService;

    constructor() {
        const usuarioRepository = new UsuarioRepository();
        const rolRepository = new RolRepository();
        const codigoRepository = new CodigoVerificacionRepository();
        const mailerService = new MailerService();
        const verificacionService = new VerificacionService(codigoRepository, usuarioRepository, mailerService);
        const organizacionRepository = new OrganizacionRepository();

        this.registroService = new RegistroOrganizacionService(
            usuarioRepository, organizacionRepository, rolRepository, verificacionService,
        );
    }

    registrar = async (req: Request, res: Response) => {
        const dto = req.dto as RegistroOrganizacionDTO;
        const resultado = await this.registroService.registrar(dto);
        return res.status(resultado.ok ? 201 : 409).json(resultado);
    };
}