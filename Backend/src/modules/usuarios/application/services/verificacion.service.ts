// =================================================================
// CAPA: Application / Services
// Genera, envía y valida el código de verificación de correo.
// =================================================================
import bcrypt from 'bcrypt';

import { CodigoVerificacion } from '../../domain/entities/CodigoVerificacion';
import { ICodigoVerificacionRepository } from '../../domain/repositories/ICodigoVerificacionRepository';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { MailerService } from '../../../notificaciones/application/services/mailer.service';
import { correoCodigoVerificacion } from '../../../notificaciones/application/services/mailer.template';

const MINUTOS_EXPIRACION = 10;
const MAX_INTENTOS = 5;

type ResultadoVerificacion =
    | { ok: true }
    | { ok: false; motivo: 'EXPIRADO' | 'INCORRECTO' | 'SIN_INTENTOS' };

export class VerificacionService {
    constructor(
        private codigoRepository: ICodigoVerificacionRepository,
        private usuarioRepository: IUsuarioRepository,
        private mailerService: MailerService,
    ) {}

    async generarYEnviar(usuarioId: number, correo: string, nombre: string): Promise<void> {
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const codigoHash = await bcrypt.hash(codigo, 10);
        const expiraEn = new Date(Date.now() + MINUTOS_EXPIRACION * 60000);

        await this.codigoRepository.invalidarAnteriores(usuarioId);
        await this.codigoRepository.crear(
            new CodigoVerificacion(null, usuarioId, codigoHash, 0, expiraEn, false),
        );

        await this.mailerService.enviarInmediato(
            correo,
            'Confirma tu correo - Voluntariados UPN',
            correoCodigoVerificacion(nombre, codigo, MINUTOS_EXPIRACION),
        );
    }

    async verificar(usuarioId: number, codigoIngresado: string): Promise<ResultadoVerificacion> {
        const registro = await this.codigoRepository.buscarVigente(usuarioId);
        if (!registro || !registro.estaVigente()) {
            return { ok: false, motivo: 'EXPIRADO' };
        }

        if (!registro.puedeIntentar(MAX_INTENTOS)) {
            return { ok: false, motivo: 'SIN_INTENTOS' };
        }

        const coincide = await bcrypt.compare(codigoIngresado, registro.codigoHash);
        await this.codigoRepository.incrementarIntentos(registro.id!);

        if (!coincide) {
            return { ok: false, motivo: 'INCORRECTO' };
        }

        await this.codigoRepository.marcarUsado(registro.id!);
        await this.usuarioRepository.activarCuenta(usuarioId);
        return { ok: true };
    }
}