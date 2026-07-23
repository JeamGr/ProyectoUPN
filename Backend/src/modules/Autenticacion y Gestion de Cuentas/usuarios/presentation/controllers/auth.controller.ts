import { Request, Response } from 'express';

import { RegistroVoluntarioDTO } from '../../application/dtos/registro-voluntario.dto';
import { VerificarCodigoDTO } from '../../application/dtos/verificar-codigo.dto';
import { ReenviarCodigoDTO } from '../../application/dtos/reenviar-codigo.dto';

import { RegistroVoluntarioService } from '../../application/services/registro-voluntario.service';
import { VerificacionService } from '../../application/services/verificacion.service';

import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { RolRepository } from '../../infrastructure/repositories/rol.repository';
import { CodigoVerificacionRepository } from '../../infrastructure/repositories/codigo-verificacion.repository';
import { MailerService } from '../../../../notificaciones/application/services/mailer.service';


import { LoginDTO } from '../../application/dtos/login.dto';
import { LoginService } from '../../application/services/login.service';

export class AuthController {
    private registroService: RegistroVoluntarioService;
    private verificacionService: VerificacionService;
    private usuarioRepository: IUsuarioRepository;
    private loginService: LoginService;

    constructor() {
        this.usuarioRepository = new UsuarioRepository();
        const rolRepository = new RolRepository();
        const codigoRepository = new CodigoVerificacionRepository();
        const mailerService = new MailerService();

        this.verificacionService = new VerificacionService(codigoRepository, this.usuarioRepository, mailerService);
        this.registroService = new RegistroVoluntarioService(this.usuarioRepository, rolRepository, this.verificacionService);
        this.loginService = new LoginService(this.usuarioRepository, rolRepository);
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

        const usuario = await this.usuarioRepository.buscarPorId(dto.usuarioId);
        if (!usuario) {
            return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
        }
        if (usuario.estado === 'activo') {
            return res.status(400).json({ ok: false, mensaje: 'Esta cuenta ya está verificada' });
        }

        const perfil = await this.usuarioRepository.buscarPerfilPorUsuarioId(dto.usuarioId);
        await this.verificacionService.generarYEnviar(usuario.id!, usuario.correo, perfil?.nombres || '');

        return res.status(200).json({ ok: true, mensaje: 'Código reenviado. Revisa tu correo.' });
    };

    login = async (req: Request, res: Response) => {
    const dto = req.dto as LoginDTO;
    const resultado = await this.loginService.login(dto);
    return res.status(resultado.ok ? 200 : 401).json(resultado);
};

}