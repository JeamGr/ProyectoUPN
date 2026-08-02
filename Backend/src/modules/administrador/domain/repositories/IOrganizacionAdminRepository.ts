export type EstadoValidacionOrganizacion = 'pendiente_validacion' | 'aprobado' | 'rechazado';

export interface OrganizacionAdminItem {
    usuarioId: number;
    correo: string;
    nombreOng: string;
    razonSocial: string;
    ruc: string;
    descripcionActividad: string | null;
    lineaIntervencion: string | null;
    pais: string;
    direccion: string;
    personaContacto: string;
    tipoDocumentoContacto: string;
    numeroDocumentoContacto: string;
    celularContacto: string;
    linkWeb: string | null;
    linkRedesSociales: string;
    constituidaLegalmente: string;
    estadoValidacion: EstadoValidacionOrganizacion;
    estadoCuenta: string;
    fechaRegistro: Date;
    totalOportunidades: number;
}

export interface IOrganizacionAdminRepository {
    listar(estado?: EstadoValidacionOrganizacion): Promise<OrganizacionAdminItem[]>;
    buscarPorId(usuarioId: number): Promise<OrganizacionAdminItem | null>;
    cambiarEstadoValidacion(usuarioId: number, estado: EstadoValidacionOrganizacion): Promise<void>;
    contarPorEstado(): Promise<Record<EstadoValidacionOrganizacion, number>>;
}