// =================================================================
// CAPA: Presentation / Controllers
// Endpoints del registro y verificación de correo.
// =================================================================
import { Request, Response } from 'express';

import { RegistroDTO } from '../../application/dtos/registro.dto';
import { VerificarCodigoDTO } from '../../application/dtos/verificar-codigo.dto';
import { ReenviarCodigoDTO } from '../../application/dtos/reenviar-codigo.dto';

import { RegistroService } from '../../application/services/registro.service';
import { VerificacionService } from '../../application/services/verificacion.service';

import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { CodigoVerificacionRepository } from '../../infrastructure/repositories/codigo-verificacion.repository';
import { MailerService } from '../../../notificaciones/application/services/mailer.service';

export class AuthController {
    private registroService: RegistroService;
    private verificacionService: VerificacionService;

    constructor() {
        const usuarioRepository = new UsuarioRepository();
        const codigoRepository = new CodigoVerificacionRepository();
        const mailerService = new MailerService();

        this.verificacionService = new VerificacionService(codigoRepository, usuarioRepository, mailerService);
        this.registroService = new RegistroService(usuarioRepository, this.verificacionService);
    }

    // ============================================================
    // POST /auth/registro
    // ============================================================
    registrar = async (req: Request, res: Response) => {
        const dto = req.dto as RegistroDTO;
        const resultado = await this.registroService.registrar(dto);

        if (!resultado.ok) {
            return res.status(409).json(resultado);
        }
        return res.status(201).json(resultado);
    };

    // ============================================================
    // POST /auth/verificar-codigo
    // ============================================================
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

    // ============================================================
    // POST /auth/reenviar-codigo
    // ============================================================
    reenviarCodigo = async (req: Request, res: Response) => {
        const dto = req.dto as ReenviarCodigoDTO;
        // Nota: la validación de "no reenviar antes de X segundos" usa
        // configuracion_sistema y se agrega cuando conectemos ese servicio.
        await this.verificacionService.generarYEnviar(dto.usuarioId, '', ''); // TODO: traer correo/nombre real por usuarioId
        return res.status(200).json({ ok: true, mensaje: 'Código reenviado. Revisa tu correo.' });
    };
}