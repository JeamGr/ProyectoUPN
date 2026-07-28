// ⚠️ Este es el único archivo que sabe "qué tabla corresponde a qué tipo".
// El resto del módulo (service, controller, domain) es agnóstico a eso.
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';

import { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository';
import { ItemCatalogo, TipoCatalogo, EstadoCatalogo } from '../../domain/entities/ItemCatalogo';
import { LineaIntervencionModel, CategoriaOrganizacionModel, UbicacionModel } from '../models/catalogo.model';
import { CatalogoMapping } from '../mappings/catalogo.mapping';

export class CatalogoRepository implements ICatalogoRepository {
    private lineaRepo: Repository<LineaIntervencionModel>;
    private categoriaRepo: Repository<CategoriaOrganizacionModel>;
    private ubicacionRepo: Repository<UbicacionModel>;

    constructor() {
        this.lineaRepo = AppDataSource.getRepository(LineaIntervencionModel);
        this.categoriaRepo = AppDataSource.getRepository(CategoriaOrganizacionModel);
        this.ubicacionRepo = AppDataSource.getRepository(UbicacionModel);
    }

    private repoPara(tipo: TipoCatalogo): Repository<any> {
        switch (tipo) {
            case 'linea_intervencion':
                return this.lineaRepo;
            case 'categoria_organizacion':
                return this.categoriaRepo;
            case 'ubicacion':
                return this.ubicacionRepo;
        }
    }

    async listar(tipo: TipoCatalogo, soloActivos = false): Promise<ItemCatalogo[]> {
        const where = soloActivos ? { estado: 'activo' } : {};
        const modelos = await this.repoPara(tipo).find({ where, order: { nombre: 'ASC' } });
        return modelos.map((m: any) => CatalogoMapping.toDomain(tipo, m));
    }

    async buscarPorId(tipo: TipoCatalogo, id: number): Promise<ItemCatalogo | null> {
        const modelo = await this.repoPara(tipo).findOne({ where: { id } });
        return modelo ? CatalogoMapping.toDomain(tipo, modelo) : null;
    }

    async buscarPorNombre(tipo: TipoCatalogo, nombre: string): Promise<ItemCatalogo | null> {
        const modelo = await this.repoPara(tipo).findOne({ where: { nombre } });
        return modelo ? CatalogoMapping.toDomain(tipo, modelo) : null;
    }

    async crear(item: ItemCatalogo): Promise<ItemCatalogo> {
        const repo = this.repoPara(item.tipo);
        const datos: any = { nombre: item.nombre, estado: item.estado };
        if (item.tipo === 'linea_intervencion') datos.icono = item.icono;

        const guardado = await repo.save(repo.create(datos));
        return CatalogoMapping.toDomain(item.tipo, guardado);
    }

    async actualizar(tipo: TipoCatalogo, id: number, cambios: { nombre?: string; icono?: string | null }): Promise<void> {
        const datos: any = {};
        if (cambios.nombre !== undefined) datos.nombre = cambios.nombre;
        // "icono" solo existe en la tabla lineas_intervencion.
        if (cambios.icono !== undefined && tipo === 'linea_intervencion') datos.icono = cambios.icono;

        if (Object.keys(datos).length === 0) return;
        await this.repoPara(tipo).update({ id }, datos);
    }

    async cambiarEstado(tipo: TipoCatalogo, id: number, estado: EstadoCatalogo): Promise<void> {
        await this.repoPara(tipo).update({ id }, { estado });
    }
}
