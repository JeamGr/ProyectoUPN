import { ConfiguracionSistemaModel } from '../models/parametro-sistema.model';
import { ParametroSistema } from '../../domain/entities/ParametroSistema';

export class ParametroMapping {
    static toDomain(model: ConfiguracionSistemaModel): ParametroSistema {
        return new ParametroSistema(
            model.clave,
            model.valor,
            model.descripcion,
            model.actualizado_por !== null ? Number(model.actualizado_por) : null,
            model.fecha_actualizacion,
        );
    }
}
