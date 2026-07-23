import bcrypt from 'bcryptjs';

import { LoginDTO } from '../dtos/login.dto';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IRolRepository } from '../../domain/repositories/IRolRepository';
import { TokenBuilder, Rol } from '../../../../../shared/builders/token.builder';

const MAX_INTENTOS_FALLIDOS = 5;
const MINUTOS_BLOQUEO = 15;
const MENSAJE_GENERICO = 'Correo o contraseña incorrectos';

export class LoginService {
    constructor(
        private usuarioRepository: IUsuarioRepository,
        private rolRepository: IRolRepository,
    ) {}

    async login(dto: LoginDTO) {
        const usuario = await this.usuarioRepository.buscarPorEmail(dto.correo);

        // Nunca revelamos si el correo existe o no -> mismo mensaje genérico siempre
        if (!usuario || usuario.estado === 'eliminado') {
            return { ok: false as const, mensaje: MENSAJE_GENERICO };
        }

        if (usuario.estado === 'pendiente_verificacion') {
            return {
                ok: false as const,
                mensaje: 'Debes verificar tu correo antes de iniciar sesión',
                usuarioId: usuario.id, // el frontend puede redirigir directo a "ingresa tu código"
            };
        }

        if (usuario.estado === 'bloqueado') {
            if (usuario.estaBloqueadoTemporalmente(MINUTOS_BLOQUEO)) {
                return { ok: false as const, mensaje: 'Cuenta bloqueada temporalmente. Intenta de nuevo en unos minutos.' };
            }
            // Ya pasó el tiempo de bloqueo -> autodesbloqueo silencioso
            await this.usuarioRepository.desbloquearCuenta(usuario.id!);
        }

        const passwordCorrecta = await bcrypt.compare(dto.password, usuario.passwordHash);

        if (!passwordCorrecta) {
            await this.usuarioRepository.incrementarIntentosFallidos(usuario.id!);

            if (usuario.intentosFallidos + 1 >= MAX_INTENTOS_FALLIDOS) {
                await this.usuarioRepository.bloquearCuenta(usuario.id!);
                return { ok: false as const, mensaje: 'Cuenta bloqueada por múltiples intentos fallidos. Intenta más tarde.' };
            }
            return { ok: false as const, mensaje: MENSAJE_GENERICO };
        }

        await this.usuarioRepository.resetearIntentosFallidos(usuario.id!);

        const rol = await this.rolRepository.buscarPorId(usuario.rolId);
        if (!rol) {
            throw { status: 500, mensaje: 'El rol del usuario no existe. Revisa la tabla roles.' };
        }

        const token = new TokenBuilder()
            .conUsuario(usuario.id!)
            .conRol(rol.nombre as Rol)
            .conCorreo(usuario.correo)
            .conExpiracion(process.env.JWT_EXPIRES_IN || '24h')
            .firmar();

        return {
            ok: true as const,
            token,
            usuario: { id: usuario.id, correo: usuario.correo, rol: rol.nombre },
        };
    }
}