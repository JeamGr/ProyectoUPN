export class Organizacion {
    constructor(
        public usuarioId: number,
        public nombreOng: string,
        public direccion: string,
        public personaContacto: string,
        public tipoDocumentoContacto: 'DNI' | 'CE' | 'PASAPORTE',
        public numeroDocumentoContacto: string,
        public celularContacto: string,
        public linkRedesSociales: string,
        public constituidaLegalmente: 'SI' | 'NO' | 'EN_PROCESO',
        public ruc: string,
        public razonSocial: string,
        public tieneCertificadoDonacion: 'SI' | 'NO' | 'EN_PROCESO',
        public descripcionActividad: string | null = null,
        public lineaIntervencionId: number | null = null,
        public categoriaId: number | null = null,
        public pais: string = 'Perú',
        public linkWeb: string | null = null,
        public numeroBeneficiariosAnual: string | null = null,
        public tieneProgramaVoluntariadoCorporativo: 'SI' | 'NO' | 'EN_PROCESO' | null = null,
        public estadoValidacion: 'pendiente_validacion' | 'aprobado' | 'rechazado' = 'pendiente_validacion',
    ) {}

    // RN-01: solo puede publicar oportunidades si esta aprobada.
    estaAprobada(): boolean {
        return this.estadoValidacion === 'aprobado';
    }
}