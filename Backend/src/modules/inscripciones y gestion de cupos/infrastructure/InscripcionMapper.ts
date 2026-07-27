import { InscripcionModel } from './InscripcionModel';
import { Inscripcion } from '../domain/Inscripcion';

export class InscripcionMapper {
    static toDomain(model: InscripcionModel): Inscripcion {
        return new Inscripcion(
            Number(model.id),
            Number(model.usuario_id),
            Number(model.oportunidad_id),
            model.estado,
            model.fecha_inscripcion,
            model.fecha_cancelacion,
            model.motivo_cancelacion
        );
    }
}
