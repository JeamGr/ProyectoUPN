// =================================================================
// CAPA: Domain / Factories
// =================================================================

import { Oportunidad, Modalidad } from '../entities/Oportunidad';

interface DatosCreacion {
    organizacionId: number;
    titulo: string;
    descripcion: string;
    lineaIntervencionId: number;
    modalidad: Modalidad;
    ubicacionId: number;
    fechaInicio: Date;
    fechaFin: Date;
    horasAcreditadas: number;
    cuposTotales: number;
    requisitos?: string;
    imagenUrl?: string;
    requiereAprobacion?: boolean;
}

export class OportunidadFactory {
    static crear(datos: DatosCreacion): Oportunidad {
        return new Oportunidad(
            null,
            datos.organizacionId,
            datos.titulo,
            datos.descripcion,
            datos.lineaIntervencionId,
            datos.modalidad,
            datos.ubicacionId,
            datos.fechaInicio,
            datos.fechaFin,
            datos.horasAcreditadas,
            datos.cuposTotales,
            datos.cuposTotales, // al crear, disponibles = totales
            'borrador',
            datos.requisitos ?? null,
            datos.imagenUrl ?? null,
            null,
            null,
            null,
            datos.requiereAprobacion ?? false,
        );
    }
}