import { Request, Response } from 'express';

import { RegistroVoluntarioDTO } from '../../application/dtos/registro-voluntario.dto';
import { VerificarCodigoDTO } from '../../application/dtos/verificar-codigo.dto';
import { ReenviarCodigoDTO } from '../../application/dtos/reenviar-codigo.dto';

import { RegistroVoluntarioService } from '../../application/services/registro-voluntario.service';
import { VerificacionService } from '../../application/services/verificacion.service';

import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { RolRepository } from '../../infrastructure/repositories/rol.repository';
import { CodigoVerificacionRepository } from '../../infrastructure/repositories/codigo-verificacion.repository';
import { MailerService } from '../../../../notificaciones/application/services/mailer.service';

export class AuthController {
    private registroService: RegistroVoluntarioService;
    private verificacionService: VerificacionService;

    constructor() {
        const usuarioRepository = new UsuarioRepository();
        const rolRepository = new RolRepository();
        const codigoRepository = new CodigoVerificacionRepository();
        const mailerService = new MailerService();

        this.verificacionService = new VerificacionService(codigoRepository, usuarioRepository, mailerService);
        this.registroService = new RegistroVoluntarioService(usuarioRepository, rolRepository, this.verificacionService);
    }

    registrar = async (req: Request, res: Response) => {
        const dto = req.dto as RegistroVoluntarioDTO;
        const resultado = await this.registroService.registrar(dto);
        return res.status(resultado.ok ? 201 : 409).json(resultado);
    };

    verificarCodigo = async (req: Request, res: Response) => {
        const dto = req.dto as VerificarCodigoDTO;
        const resultado = await this.verificacionService.verificar(dto.usuarioId, dto.codigo);

        if (!resultado.ok) {
            const mensajes = {
                EXPIRADO: 'El código expiró o ya fue usado. Solicita uno nuevo.',
                INCORRECTO: 'El código ingresado es incorrecto.',
                SIN_INTENTOS: 'Superaste el número de intentos permitidos. Solicita un código nuevo.',
            };
            return res.status(400).json({ ok: false, mensaje: mensajes[resultado.motivo] });
        }
        return res.status(200).json({ ok: true, mensaje: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.' });
    };

    reenviarCodigo = async (req: Request, res: Response) => {
        const dto = req.dto as ReenviarCodigoDTO;
        // TODO (igual que antes): resolver correo/nombre real con usuarioRepository.buscarPorId + buscarPerfilPorCodigoEstudiante
        await this.verificacionService.generarYEnviar(dto.usuarioId, '', '');
        return res.status(200).json({ ok: true, mensaje: 'Código reenviado. Revisa tu correo.' });
    };
}