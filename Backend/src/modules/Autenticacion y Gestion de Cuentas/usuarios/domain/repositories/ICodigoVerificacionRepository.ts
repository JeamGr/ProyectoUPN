// =================================================================
// CAPA: Domain / Repositories (interfaz)
// =================================================================

import { CodigoVerificacion } from '../entities/CodigoVerificacion';

export interface ICodigoVerificacionRepository {
    crear(codigo: CodigoVerificacion): Promise<void>;

    /** Marca como usados/expirados los códigos anteriores del usuario. */
    invalidarAnteriores(usuarioId: number): Promise<void>;

    /** Trae el código vigente más reciente (no usado, aunque haya expirado). */
    buscarVigente(usuarioId: number): Promise<CodigoVerificacion | null>;

    incrementarIntentos(codigoId: number): Promise<void>;
    marcarUsado(codigoId: number): Promise<void>;
}