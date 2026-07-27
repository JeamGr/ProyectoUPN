import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ITokenInvalidadoRepository } from '../../domain/repositories/ITokenInvalidadoRepository';

export class LogoutService {
    constructor(private tokenInvalidadoRepository: ITokenInvalidadoRepository) {}

    async cerrarSesion(tokenCrudo: string) {
        const payload = jwt.decode(tokenCrudo) as { exp: number } | null;
        if (!payload?.exp) return { ok: false as const, mensaje: 'Token inválido' };

        const tokenHash = crypto.createHash('sha256').update(tokenCrudo).digest('hex');
        await this.tokenInvalidadoRepository.invalidar(tokenHash, new Date(payload.exp * 1000));
        return { ok: true as const, mensaje: 'Sesión cerrada correctamente.' };
    }
}