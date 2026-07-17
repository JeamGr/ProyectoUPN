// =================================================================
// CAPA: Domain / Repositories (interfaz)
// El domain define QUE necesita, infrastructure define COMO lo hace.
// Esto permite cambiar TypeORM por otra cosa sin tocar el negocio.
// =================================================================

import { Usuario } from '../entities/Usuario';

export interface IUsuarioRepository {
    buscarPorEmail(email: string): Promise<Usuario | null>;
    buscarPorCodigoEstudiante(codigoEstudiante: string): Promise<Usuario | null>;
    buscarPorId(id: number): Promise<Usuario | null>;

    /**
     * Crea el usuario y sus intereses en UNA sola transacción,
     * para que nunca quede un usuario sin sus categorías o viceversa.
     */
    crearConIntereses(usuario: Usuario): Promise<Usuario>;

    activarCuenta(usuarioId: number): Promise<void>;
}