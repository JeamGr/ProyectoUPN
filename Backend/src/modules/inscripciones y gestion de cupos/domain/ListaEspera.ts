// =================================================================
// CAPA: Domain
// Entidad de dominio de Lista de Espera (RF-028).
// =================================================================

export class ListaEspera {
    constructor(
        public readonly id: number,
        public readonly usuarioId: number,
        public readonly oportunidadId: number,
        public readonly posicion: number,
        public readonly fechaRegistro: Date,
        public notificado: boolean
    ) {}
}
