import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { TokenRecuperacion } from '../../domain/entities/TokenRecuperacion';
import { ITokenRecuperacionRepository } from '../../domain/repositories/ITokenRecuperacionRepository';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { MailerService } from '../../../../notificaciones/application/services/mailer.service';
import { correoRecuperacionPassword } from '../../../../notificaciones/application/services/mailer.template';

const HORAS_EXPIRACION = 1;
const MENSAJE_SIEMPRE = 'Si el correo existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña.';

export class RecuperacionPasswordService {
    constructor(
        private tokenRepository: ITokenRecuperacionRepository,
        private usuarioRepository: IUsuarioRepository,
        private mailerService: MailerService,
    ) {}

    async solicitar(correo: string) {
        const usuario = await this.usuarioRepository.buscarPorEmail(correo);
        if (!usuario || usuario.estado !== 'activo') {
            return { ok: true as const, mensaje: MENSAJE_SIEMPRE };
        }

        const tokenPlano = crypto.randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(tokenPlano, 10);
        const expiraEn = new Date(Date.now() + HORAS_EXPIRACION * 3600000);

        await this.tokenRepository.invalidarAnteriores(usuario.id!);
        await this.tokenRepository.crear(new TokenRecuperacion(null, usuario.id!, tokenHash, expiraEn, false));

        const enlace = `${process.env.FRONTEND_URL}/restablecer-password?usuarioId=${usuario.id}&token=${tokenPlano}`;
        await this.mailerService.enviarInmediato(
            usuario.correo,
            'Recupera tu contraseña - Voluntariados UPN',
            correoRecuperacionPassword(enlace, HORAS_EXPIRACION),
        );

        return { ok: true as const, mensaje: MENSAJE_SIEMPRE };
    }

    async confirmar(usuarioId: number, tokenPlano: string, passwordNueva: string) {
        const registro = await this.tokenRepository.buscarVigentePorUsuario(usuarioId);
        if (!registro || !registro.estaVigente()) {
            return { ok: false as const, mensaje: 'El enlace expiró o ya fue usado. Solicita uno nuevo.' };
        }

        const coincide = await bcrypt.compare(tokenPlano, registro.tokenHash);
        if (!coincide) {
            return { ok: false as const, mensaje: 'El enlace no es válido.' };
        }

        const nuevoHash = await bcrypt.hash(passwordNueva, 10);
        await this.usuarioRepository.actualizarPassword(usuarioId, nuevoHash);
        await this.tokenRepository.marcarUsado(registro.id!);
        await this.usuarioRepository.desbloquearCuenta(usuarioId);

        return { ok: true as const, mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' };
    }
}