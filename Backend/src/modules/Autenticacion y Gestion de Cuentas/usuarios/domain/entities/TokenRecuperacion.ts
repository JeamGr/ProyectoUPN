export class TokenRecuperacion {
    constructor(
        public id: number | null,
        public usuarioId: number,
        public tokenHash: string,
        public expiraEn: Date,
        public usado: boolean,
    ) {}

    estaVigente(): boolean {
        return !this.usado && this.expiraEn.getTime() > Date.now();
    }
}