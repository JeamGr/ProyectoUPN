import { AppDataSource } from '../../../../config/datasource';
import {
    IOrganizacionAdminRepository,
    OrganizacionAdminItem,
    EstadoValidacionOrganizacion,
} from '../../domain/repositories/IOrganizacionAdminRepository';

const SELECT_BASE = `
    SELECT
        o.usuario_id                        AS usuarioId,
        u.correo                            AS correo,
        u.estado                            AS estadoCuenta,
        u.fecha_registro                    AS fechaRegistro,
        o.nombre_ong                        AS nombreOng,
        o.razon_social                      AS razonSocial,
        o.ruc                               AS ruc,
        o.descripcion_actividad             AS descripcionActividad,
        li.nombre                           AS lineaIntervencion,
        o.pais                              AS pais,
        o.direccion                         AS direccion,
        o.persona_contacto                  AS personaContacto,
        o.tipo_documento_contacto           AS tipoDocumentoContacto,
        o.numero_documento_contacto         AS numeroDocumentoContacto,
        o.celular_contacto                  AS celularContacto,
        o.link_web                          AS linkWeb,
        o.link_redes_sociales               AS linkRedesSociales,
        o.constituida_legalmente            AS constituidaLegalmente,
        o.estado_validacion                 AS estadoValidacion,
        (SELECT COUNT(*) FROM oportunidades op WHERE op.organizacion_id = o.usuario_id) AS totalOportunidades
    FROM organizaciones o
    INNER JOIN usuarios u ON u.id = o.usuario_id
    LEFT  JOIN lineas_intervencion li ON li.id = o.linea_intervencion_id
`;

export class OrganizacionAdminRepository implements IOrganizacionAdminRepository {
    async listar(estado?: EstadoValidacionOrganizacion): Promise<OrganizacionAdminItem[]> {
        const where = estado ? 'WHERE o.estado_validacion = ?' : '';
        const params = estado ? [estado] : [];
        const filas = await AppDataSource.query(
            `${SELECT_BASE} ${where} ORDER BY u.fecha_registro DESC`,
            params,
        );
        return filas.map(this.mapear);
    }

    async buscarPorId(usuarioId: number): Promise<OrganizacionAdminItem | null> {
        const filas = await AppDataSource.query(`${SELECT_BASE} WHERE o.usuario_id = ? LIMIT 1`, [usuarioId]);
        return filas.length > 0 ? this.mapear(filas[0]) : null;
    }

    async cambiarEstadoValidacion(usuarioId: number, estado: EstadoValidacionOrganizacion): Promise<void> {
        await AppDataSource.query(
            'UPDATE organizaciones SET estado_validacion = ? WHERE usuario_id = ?',
            [estado, usuarioId],
        );
    }

    async contarPorEstado(): Promise<Record<EstadoValidacionOrganizacion, number>> {
        const filas = await AppDataSource.query(
            'SELECT estado_validacion AS estado, COUNT(*) AS total FROM organizaciones GROUP BY estado_validacion',
        );
        const conteo: Record<EstadoValidacionOrganizacion, number> = {
            pendiente_validacion: 0,
            aprobado: 0,
            rechazado: 0,
        };
        filas.forEach((f: any) => {
            conteo[f.estado as EstadoValidacionOrganizacion] = Number(f.total);
        });
        return conteo;
    }

    private mapear = (f: any): OrganizacionAdminItem => ({
        usuarioId: Number(f.usuarioId),
        correo: f.correo,
        nombreOng: f.nombreOng,
        razonSocial: f.razonSocial,
        ruc: f.ruc,
        descripcionActividad: f.descripcionActividad,
        lineaIntervencion: f.lineaIntervencion,
        pais: f.pais,
        direccion: f.direccion,
        personaContacto: f.personaContacto,
        tipoDocumentoContacto: f.tipoDocumentoContacto,
        numeroDocumentoContacto: f.numeroDocumentoContacto,
        celularContacto: f.celularContacto,
        linkWeb: f.linkWeb,
        linkRedesSociales: f.linkRedesSociales,
        constituidaLegalmente: f.constituidaLegalmente,
        estadoValidacion: f.estadoValidacion,
        estadoCuenta: f.estadoCuenta,
        fechaRegistro: f.fechaRegistro,
        totalOportunidades: Number(f.totalOportunidades),
    });
}