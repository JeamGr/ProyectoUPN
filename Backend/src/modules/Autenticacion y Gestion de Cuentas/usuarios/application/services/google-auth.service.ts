// ⚠️ npm install google-auth-library --save
import { OAuth2Client } from 'google-auth-library';
import { TokenBuilder, Rol } from '../../../../../shared/builders/token.builder';
import { LoginGoogleDTO } from '../dtos/login-google.dto';

import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IRolRepository } from '../../domain/repositories/IRolRepository';
import { IIdentidadOAuthRepository } from '../../domain/repositories/IIdentidadOAuthRepository';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthService {
    constructor(
        private usuarioRepository: IUsuarioRepository,
        private rolRepository: IRolRepository,
        private identidadRepository: IIdentidadOAuthRepository,
    ) {}

    async login(dto: LoginGoogleDTO) {
        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({ idToken: dto.idToken, audience: process.env.GOOGLE_CLIENT_ID });
            payload = ticket.getPayload();
        } catch {
            return { ok: false as const, mensaje: 'Token de Google inválido.' };
        }

        if (!payload || !payload.email_verified) {
            return { ok: false as const, mensaje: 'Tu cuenta de Google no tiene el correo verificado.' };
        }

        let identidad = await this.identidadRepository.buscarPorProveedor('google', payload.sub!);
        let usuario;

        if (identidad) {
            usuario = await this.usuarioRepository.buscarPorId(identidad.usuarioId);
        } else {
            usuario = await this.usuarioRepository.buscarPorEmail(payload.email!);
            if (!usuario) {
                const rolVoluntario = await this.rolRepository.buscarPorNombre('VOLUNTARIO');
                if (!rolVoluntario) throw { status: 500, mensaje: 'No se encontró el rol VOLUNTARIO.' };
                usuario = await this.usuarioRepository.crearUsuarioOAuth(payload.email!, rolVoluntario.id);
            }
            await this.identidadRepository.vincular(usuario.id!, 'google', payload.sub!, payload.email!);
        }

        if (!usuario) return { ok: false as const, mensaje: 'No se pudo resolver el usuario.' };
        if (usuario.estado === 'bloqueado') {
            return { ok: false as const, mensaje: 'Cuenta bloqueada temporalmente.' };
        }

        const rol = await this.rolRepository.buscarPorId(usuario.rolId);
        const token = new TokenBuilder()
            .conUsuario(usuario.id!)
            .conRol(rol!.nombre as Rol)
            .conCorreo(usuario.correo)
            .conExpiracion(process.env.JWT_EXPIRES_IN || '24h')
            .firmar();

        return { ok: true as const, token, usuario: { id: usuario.id, correo: usuario.correo, rol: rol!.nombre } };
    }
}