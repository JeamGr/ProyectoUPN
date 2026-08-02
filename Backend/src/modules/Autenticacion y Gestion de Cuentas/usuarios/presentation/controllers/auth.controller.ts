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

import { SolicitarRecuperacionDTO } from '../../application/dtos/solicitar-recuperacion.dto';
import { ConfirmarRecuperacionDTO } from '../../application/dtos/confirmar-recuperacion.dto';
import { RecuperacionPasswordService } from '../../application/services/recuperacion-password.service';
import { TokenRecuperacionRepository } from '../../infrastructure/repositories/token-recuperacion.repository';

import { LoginDTO } from '../../application/dtos/login.dto';
import { LoginService } from '../../application/services/login.service';
import { LoginGoogleDTO } from '../../application/dtos/login-google.dto';
import { GoogleAuthService } from '../../application/services/google-auth.service';
import { LogoutService } from '../../application/services/logout.service';
import { IdentidadOAuthRepository } from '../../infrastructure/repositories/identidad-oauth.repository';
import { TokenInvalidadoRepository } from '../../infrastructure/repositories/token-invalidado.repository';
export class AuthController {
    private registroService: RegistroVoluntarioService;
    private verificacionService: VerificacionService;
    private usuarioRepository: IUsuarioRepository;
    private loginService: LoginService;
    private recuperacionService: RecuperacionPasswordService;
    private googleAuthService: GoogleAuthService;
    private logoutService: LogoutService;
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
        const rolRepository = new RolRepository();
        const codigoRepository = new CodigoVerificacionRepository();
        const mailerService = new MailerService();
        const tokenRecuperacionRepository = new TokenRecuperacionRepository();
        const identidadRepository = new IdentidadOAuthRepository();
        this.googleAuthService = new GoogleAuthService(this.usuarioRepository, rolRepository, identidadRepository);

        const tokenInvalidadoRepository = new TokenInvalidadoRepository();
        this.logoutService = new LogoutService(tokenInvalidadoRepository);
        this.verificacionService = new VerificacionService(codigoRepository, this.usuarioRepository, mailerService);
        this.registroService = new RegistroVoluntarioService(this.usuarioRepository, rolRepository, this.verificacionService);
        this.loginService = new LoginService(this.usuarioRepository, rolRepository);
        this.recuperacionService = new RecuperacionPasswordService(tokenRecuperacionRepository, this.usuarioRepository, mailerService);
    }

    registrar = async (req: Request, res: Response) => {
        const dto = req.dto as RegistroVoluntarioDTO;
        const resultado = await this.registroService.registrar(dto);
        return res.status(resultado.ok ? 201 : 409).json(resultado);
    };

    loginGoogle = async (req: Request, res: Response) => {
        const dto = req.dto as LoginGoogleDTO;
        const resultado = await this.googleAuthService.login(dto);
        return res.status(resultado.ok ? 200 : 401).json(resultado);
    };

    // -----------------------------------------------------------------
    // GET /auth/me  (RNF-01, fix de seguridad)
    // El frontend no puede confiar en localStorage para decidir si hay
    // sesion: un token expirado, revocado por logout o de OTRO rol sigue
    // "existiendo" en localStorage. Este endpoint es la unica fuente de
    // verdad: pasa por authHandler (verifica firma, expiracion y lista de
    // tokens invalidados) y devuelve la identidad real del portador.
    // -----------------------------------------------------------------
    me = async (req: Request, res: Response) => {
        const usuario = await this.usuarioRepository.buscarPorId(req.jwt!.id);
        if (!usuario || usuario.estado === 'eliminado' || usuario.estado === 'bloqueado') {
            return res.status(401).json({ ok: false, mensaje: 'Sesion no valida' });
        }

        return res.status(200).json({
            ok: true,
            usuario: {
                id: usuario.id,
                correo: usuario.correo,
                rol: req.jwt!.rol,
                estado: usuario.estado,
            },
        });
    };

    logout = async (req: Request, res: Response) => {
        const token = req.headers.authorization!.split(' ')[1];
        const resultado = await this.logoutService.cerrarSesion(token);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
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
solicitarRecuperacion = async (req: Request, res: Response) => {
    const dto = req.dto as SolicitarRecuperacionDTO;
    const resultado = await this.recuperacionService.solicitar(dto.correo);
    return res.status(200).json(resultado);
};

confirmarRecuperacion = async (req: Request, res: Response) => {
    const dto = req.dto as ConfirmarRecuperacionDTO;
    const resultado = await this.recuperacionService.confirmar(dto.usuarioId, dto.token, dto.passwordNueva);
    return res.status(resultado.ok ? 200 : 400).json(resultado);
};
}