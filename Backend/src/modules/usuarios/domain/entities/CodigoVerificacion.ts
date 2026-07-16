// =================================================================
// CAPA: Domain / Entities
// Encapsula las reglas de negocio del código de verificación:
// vigencia y límite de intentos. Nada de esto depende de TypeORM.
// =================================================================

export class CodigoVerificacion {
    constructor(
        public id: number | null,
        public usuarioId: number,
        public codigoHash: string,
        public intentos: number,
        public expiraEn: Date,
        public usado: boolean,
    ) {}

    estaVigente(): boolean {
        return !this.usado && this.expiraEn.getTime() > Date.now();
    }

    puedeIntentar(maxIntentos: number): boolean {
        return this.intentos < maxIntentos;
    }
}