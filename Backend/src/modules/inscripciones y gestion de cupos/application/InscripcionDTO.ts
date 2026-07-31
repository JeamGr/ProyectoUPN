// ==========================================
// DTOs DE ENTRADA
// ==========================================

export interface InscribirseDTO {
    oportunidad_id: number;
}

export interface CancelarInscripcionDTO {
    motivo_cancelacion?: string;
}

export interface RechazarInscripcionDTO {
    // Obligatorio: el schema solo tiene una columna "motivo_cancelacion" para
    // guardar el motivo, tanto de cancelación como de rechazo (ver nota en
    // MysqlInscripcionRepository.rechazarInscripcion).
    motivo: string;
}

// ==========================================
// DTOs DE SALIDA
// ==========================================

export interface InscripcionResponseDTO {
    id: number;
    usuario_id: number;
    oportunidad_id: number;
    estado: string;
    fecha_inscripcion: Date;
    fecha_cancelacion: Date | null;
    motivo_cancelacion: string | null;
    en_lista_espera: boolean;
    posicion_lista_espera?: number;
}

export interface InscritoListadoDTO {
    inscripcion_id: number;
    usuario_id: number;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string | null;
    codigo_estudiante: string;
    estado: string;
    fecha_inscripcion: Date;
}

export interface ListaEsperaItemDTO {
    usuario_id: number;
    nombres: string;
    apellidos: string;
    correo: string;
    posicion: number;
    fecha_registro: Date;
}

// Datos mínimos de la oportunidad que el Service necesita para
// tomar decisiones de negocio (no es el DTO completo de M3).
export interface OportunidadParaInscripcionDTO {
    id: number;
    organizacion_id: number;
    estado: string;
    cupos_disponibles: number;
    cupos_totales: number;
    requiere_aprobacion: boolean;
}
