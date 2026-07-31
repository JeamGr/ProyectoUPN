// =================================================================
// CAPA: Domain / Repositories (interfaz)
// =================================================================

import { ParametroSistema } from '../entities/ParametroSistema';

export interface IParametroRepository {
    listar(): Promise<ParametroSistema[]>;
    buscarPorClave(clave: string): Promise<ParametroSistema | null>;
    guardarOActualizar(
        clave: string,
        valor: string,
        descripcion: string | null,
        actualizadoPor: number,
    ): Promise<ParametroSistema>;
}
