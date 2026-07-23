// =================================================================
// CAPA: Domain / Repositories (interfaz)
// =================================================================

import { Usuario } from '../entities/Usuario';
import { PerfilVoluntario } from '../entities/PerfilVoluntario';

export interface IUsuarioRepository {
    buscarPorEmail(correo: string): Promise<Usuario | null>;
    buscarPorId(id: number): Promise<Usuario | null>;
    buscarPerfilPorCodigoEstudiante(codigoEstudiante: string): Promise<PerfilVoluntario | null>;

    /**
     * Crea `usuarios` + `perfiles_voluntario` + `usuario_intereses`
     * en UNA sola transaccion. Nunca debe quedar un usuario sin perfil.
     */
    registrarVoluntario(
        usuario: Usuario,
        perfil: PerfilVoluntario,
    ): Promise<{ usuario: Usuario; perfil: PerfilVoluntario }>;

    activarCuenta(usuarioId: number): Promise<void>;
    /**
 * Sobrescribe un registro que quedó en pendiente_verificacion (reintento).
 * NO se usa para cuentas ya activas — esas siguen bloqueadas como duplicado real.
 */
    actualizarRegistroPendiente(
        usuario: Usuario,
        perfil: PerfilVoluntario,
    ): Promise<{ usuario: Usuario; perfil: PerfilVoluntario }>;
    buscarPerfilPorUsuarioId(usuarioId: number): Promise<PerfilVoluntario | null>;
    incrementarIntentosFallidos(usuarioId: number): Promise<void>;
    resetearIntentosFallidos(usuarioId: number): Promise<void>;
    bloquearCuenta(usuarioId: number): Promise<void>;
    desbloquearCuenta(usuarioId: number): Promise<void>;
}