export type TipoEvidencia = 'foto' | 'video' | 'documento';

export class Evidencia {
    constructor(
        public id: number | null,
        public inscripcionId: number,
        public tipo: TipoEvidencia,
        public url: string,
        public subidoPor: number,
        public contenidoSensible: boolean = false, // RNF-17: excluye de vistas públicas
        public descripcion: string | null = null,
        public fechaSubida: Date = new Date(),
    ) {}
}