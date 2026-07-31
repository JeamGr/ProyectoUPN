import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';

import { IParametroRepository } from '../../domain/repositories/IParametroRepository';
import { ParametroSistema } from '../../domain/entities/ParametroSistema';
import { ConfiguracionSistemaModel } from '../models/parametro-sistema.model';
import { ParametroMapping } from '../mappings/parametro.mapping';

export class ParametroRepository implements IParametroRepository {
    private repo: Repository<ConfiguracionSistemaModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(ConfiguracionSistemaModel);
    }

    async listar(): Promise<ParametroSistema[]> {
        const modelos = await this.repo.find({ order: { clave: 'ASC' } });
        return modelos.map(ParametroMapping.toDomain);
    }

    async buscarPorClave(clave: string): Promise<ParametroSistema | null> {
        const modelo = await this.repo.findOne({ where: { clave } });
        return modelo ? ParametroMapping.toDomain(modelo) : null;
    }

    async guardarOActualizar(
        clave: string,
        valor: string,
        descripcion: string | null,
        actualizadoPor: number,
    ): Promise<ParametroSistema> {
        let modelo = await this.repo.findOne({ where: { clave } });

        if (!modelo) {
            modelo = this.repo.create({
                clave,
                valor,
                descripcion,
                actualizado_por: actualizadoPor,
                fecha_actualizacion: new Date(),
            });
        } else {
            modelo.valor = valor;
            if (descripcion !== null) modelo.descripcion = descripcion;
            modelo.actualizado_por = actualizadoPor;
            modelo.fecha_actualizacion = new Date();
        }

        const guardado = await this.repo.save(modelo);
        return ParametroMapping.toDomain(guardado);
    }
}
