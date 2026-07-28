// =================================================================
// CAPA: Domain / Repositories (interfaz)
// =================================================================

import { ItemCatalogo, TipoCatalogo, EstadoCatalogo } from '../entities/ItemCatalogo';

export interface ICatalogoRepository {
    listar(tipo: TipoCatalogo, soloActivos?: boolean): Promise<ItemCatalogo[]>;
    buscarPorId(tipo: TipoCatalogo, id: number): Promise<ItemCatalogo | null>;
    buscarPorNombre(tipo: TipoCatalogo, nombre: string): Promise<ItemCatalogo | null>;
    crear(item: ItemCatalogo): Promise<ItemCatalogo>;
    actualizar(tipo: TipoCatalogo, id: number, cambios: { nombre?: string; icono?: string | null }): Promise<void>;
    cambiarEstado(tipo: TipoCatalogo, id: number, estado: EstadoCatalogo): Promise<void>;
}
