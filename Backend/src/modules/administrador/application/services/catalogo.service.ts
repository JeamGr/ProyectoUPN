// =================================================================
// CAPA: Application / Services
// =================================================================
import { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository';
import { ItemCatalogo, TipoCatalogo } from '../../domain/entities/ItemCatalogo';
import { CrearItemCatalogoDTO, ActualizarItemCatalogoDTO } from '../dtos/catalogo.dto';

type Resultado<T = {}> = ({ ok: true } & T) | { ok: false; mensaje: string };

export class CatalogoService {
    constructor(private catalogoRepository: ICatalogoRepository) {}

    async listar(tipo: TipoCatalogo, soloActivos = false): Promise<ItemCatalogo[]> {
        return this.catalogoRepository.listar(tipo, soloActivos);
    }

    async crear(tipo: TipoCatalogo, dto: CrearItemCatalogoDTO): Promise<Resultado<{ item: ItemCatalogo }>> {
        const nombre = dto.nombre.trim();
        const existente = await this.catalogoRepository.buscarPorNombre(tipo, nombre);
        if (existente) {
            return { ok: false, mensaje: 'Ya existe un elemento con ese nombre en este catálogo' };
        }

        const nuevo = new ItemCatalogo(null, tipo, nombre, 'activo', dto.icono ?? null);
        const guardado = await this.catalogoRepository.crear(nuevo);
        return { ok: true, item: guardado };
    }

    async actualizar(tipo: TipoCatalogo, id: number, dto: ActualizarItemCatalogoDTO): Promise<Resultado> {
        const existente = await this.catalogoRepository.buscarPorId(tipo, id);
        if (!existente) return { ok: false, mensaje: 'Elemento de catálogo no encontrado' };

        const nombre = dto.nombre?.trim();
        if (nombre) {
            const duplicado = await this.catalogoRepository.buscarPorNombre(tipo, nombre);
            if (duplicado && duplicado.id !== id) {
                return { ok: false, mensaje: 'Ya existe un elemento con ese nombre en este catálogo' };
            }
        }

        await this.catalogoRepository.actualizar(tipo, id, { nombre, icono: dto.icono });
        return { ok: true };
    }

    async desactivar(tipo: TipoCatalogo, id: number): Promise<Resultado> {
        const existente = await this.catalogoRepository.buscarPorId(tipo, id);
        if (!existente) return { ok: false, mensaje: 'Elemento de catálogo no encontrado' };
        await this.catalogoRepository.cambiarEstado(tipo, id, 'inactivo');
        return { ok: true };
    }

    async activar(tipo: TipoCatalogo, id: number): Promise<Resultado> {
        const existente = await this.catalogoRepository.buscarPorId(tipo, id);
        if (!existente) return { ok: false, mensaje: 'Elemento de catálogo no encontrado' };
        await this.catalogoRepository.cambiarEstado(tipo, id, 'activo');
        return { ok: true };
    }
}
