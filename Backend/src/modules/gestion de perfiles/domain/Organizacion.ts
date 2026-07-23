export class Organizacion {
    constructor(
        public readonly usuarioId: number,
        public nombreOng: string,
        public descripcionActividad: string | null,
        public lineaIntervencionId: number | null,
        public pais: string,
        public direccion: string,
        public personaContacto: string,
        public tipoDocumentoContacto: 'DNI' | 'CE' | 'PASAPORTE',
        public numeroDocumentoContacto: string,
        public celularContacto: string,
        public linkWeb: string | null,
        public linkRedesSociales: string,
        public readonly constituidaLegalmente: 'SI' | 'NO' | 'EN_PROCESO',
        public readonly ruc: string,
        public readonly razonSocial: string,
        public numeroBeneficiariosAnual: string | null,
        public readonly tieneCertificadoDonacion: 'SI' | 'NO' | 'EN_PROCESO',
        public readonly tieneProgramaVoluntariadoCorporativo: 'SI' | 'NO' | 'EN_PROCESO' | null,
        public readonly estadoValidacion: 'pendiente_validacion' | 'aprobado' | 'rechazado'
    ) {}

    public estaAprobada(): boolean {
        return this.estadoValidacion === 'aprobado';
    }
}