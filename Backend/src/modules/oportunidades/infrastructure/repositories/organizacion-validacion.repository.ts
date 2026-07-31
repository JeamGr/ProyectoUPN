// =================================================================
// CAPA: Infrastructure / Repositories
// Consulta cruda a `organizaciones` (vive en otro modulo). No se
// importa el model de usuarios para no acoplar ambos modulos entre si.
// =================================================================
import { AppDataSource } from '../../../../config/datasource';
import { IOrganizacionValidacionRepository } from '../../domain/repositories/IOrganizacionValidacionRepository';

export class OrganizacionValidacionRepository implements IOrganizacionValidacionRepository {
    async estaAprobada(organizacionId: number): Promise<boolean> {
        const filas = await AppDataSource.query(
            'SELECT estado_validacion FROM organizaciones WHERE usuario_id = ? LIMIT 1',
            [organizacionId],
        );
        return filas.length > 0 && filas[0].estado_validacion === 'aprobado';
    }
}