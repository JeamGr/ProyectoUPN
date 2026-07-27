// =================================================================
// CAPA: Domain / Repositories (interfaz)
// =================================================================

import { Oportunidad, EstadoOportunidad } from '../entities/Oportunidad';
export type OrdenBusqueda = 'relevancia' | 'fecha' | 'popularidad';
export interface FiltrosBusqueda {
    lineaIntervencionId?: number;
    modalidad?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    textoBusqueda?: string;      // RF-022
    ubicacion?: string;          // RF-023 (texto: ciudad/distrito)
    horasMin?: number;           // RF-023 (duración en horas)
    horasMax?: number;
    ordenarPor?: OrdenBusqueda;  // RF-024
    pagina?: number;
    porPagina?: number;
}

// Lo que consume el frontend: la oportunidad + el nombre de quien la publica,
// para no obligarlo a pedir el nombre de la organizacion aparte por cada tarjeta.
export interface OportunidadConOrganizacion extends Oportunidad {
    nombreOrganizacion: string;
}

export interface IOportunidadRepository {
    buscarPorId(id: number): Promise<Oportunidad | null>;
    crear(oportunidad: Oportunidad): Promise<Oportunidad>;
    cambiarEstado(id: number, nuevoEstado: EstadoOportunidad, motivoRechazo?: string, aprobadoPor?: number): Promise<void>;

    // RN-03: decremento atomico, nunca "leer-restar-guardar" en memoria.
    // Retorna false si ya no habia cupos (otro usuario se lo gano antes).
    descontarCupo(id: number): Promise<boolean>;
    liberarCupo(id: number): Promise<void>;

    buscarPublicadas(filtros: FiltrosBusqueda): Promise<{ datos: OportunidadConOrganizacion[]; total: number }>;
    buscarRecomendadasPara(usuarioId: number): Promise<OportunidadConOrganizacion[]>;
    buscarPorOrganizacion(organizacionId: number): Promise<Oportunidad[]>;
}