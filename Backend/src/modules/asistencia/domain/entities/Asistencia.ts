export type EstadoAsistencia = 'presente' | 'ausente' | 'tardanza';

export class Asistencia {
    constructor(
        public id: number | null,
        public inscripcionId: number,
        public estado: EstadoAsistencia,
        public registradoPor: number,
        public fechaRegistro: Date = new Date(),
        public metodoRegistro: 'manual' | 'qr' = 'manual', // QR queda listo para fase 2
    ) {}

    // RF-036 simplificado: presente = cuenta las horas completas de la oportunidad
    cuentaComoHorasCompletas(): boolean {
        return this.estado === 'presente';
    }
}