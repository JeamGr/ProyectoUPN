// =================================================================
// Consulta cruda contra `inscripciones` y `oportunidades` (viven en
// otros modulos de otros companeros). Igual que con Organizacion en
// M3, NO se importan sus models para no acoplar los modulos entre si.
// =================================================================

export interface DatosInscripcion {
    inscripcionId: number;
    voluntarioId: number;
    oportunidadId: number;
    organizacionId: number;
    horasAcreditadas: number;
    nombreVoluntario: string;
    tituloOportunidad: string;
}

export interface IInscripcionConsultaRepository {
    buscarPorId(inscripcionId: number): Promise<DatosInscripcion | null>;
    buscarInscripcionDe(voluntarioId: number, oportunidadId: number): Promise<DatosInscripcion | null>;
    // Para saber si quien pide la accion es dueño de la oportunidad (Organizacion)
    obtenerOrganizacionDeOportunidad(oportunidadId: number): Promise<number | null>;
    listarInscritosDeOportunidad(oportunidadId: number): Promise<DatosInscripcion[]>;
}