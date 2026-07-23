// ==========================================
// DTOs PARA VOLUNTARIO
// ==========================================

export interface ActualizarPerfilVoluntarioDTO {
    telefono?: string;
    ubicacion?: string;
    habilidades?: string;
    disponibilidad?: string;
    foto_url?: string;
    intereses_ids?: number[];
}

export interface PerfilVoluntarioResponseDTO {
    usuario_id: number;
    codigo_estudiante: string;
    nombres: string;
    apellidos: string;
    carrera: string;
    ciclo: number;
    telefono: string | null;
    ubicacion: string | null;
    habilidades: string | null;
    disponibilidad: string | null;
    foto_url: string | null;
    correo: string;
    intereses: Array<{
        id: number;
        nombre: string;
    }>;
}

// ==========================================
// DTOs PARA ORGANIZACIÓN
// ==========================================

export interface ActualizarPerfilOrganizacionDTO {
    nombre_ong?: string;
    descripcion_actividad?: string;
    linea_intervencion_id?: number;
    pais?: string;
    direccion?: string;
    persona_contacto?: string;
    tipo_documento_contacto?: 'DNI' | 'CE' | 'PASAPORTE';
    numero_documento_contacto?: string;
    celular_contacto?: string;
    link_web?: string;
    link_redes_sociales?: string;
    numero_beneficiarios_anual?: string;
}

export interface PerfilOrganizacionResponseDTO {
    usuario_id: number;
    nombre_ong: string;
    descripcion_actividad: string | null;
    linea_intervencion_id: number | null;
    linea_intervencion_nombre?: string;
    pais: string;
    direccion: string;
    persona_contacto: string;
    tipo_documento_contacto: string;
    numero_documento_contacto: string;
    celular_contacto: string;
    link_web: string | null;
    link_redes_sociales: string;
    constituida_legalmente: string;
    ruc: string;
    razon_social: string;
    numero_beneficiarios_anual: string | null;
    tiene_certificado_donacion: string;
    tiene_programa_voluntariado_corporativo: string | null;
    estado_validacion: string;
    correo: string;
}

// ==========================================
// DTOs PARA PREFERENCIAS DE NOTIFICACIÓN
// ==========================================

export interface ActualizarPreferenciasDTO {
    notificar_confirmacion?: boolean;
    notificar_recordatorio?: boolean;
    notificar_certificado?: boolean;
    notificar_nuevas_oportunidades?: boolean;
}

export interface PreferenciasResponseDTO {
    usuario_id: number;
    notificar_confirmacion: boolean;
    notificar_recordatorio: boolean;
    notificar_certificado: boolean;
    notificar_nuevas_oportunidades: boolean;
}