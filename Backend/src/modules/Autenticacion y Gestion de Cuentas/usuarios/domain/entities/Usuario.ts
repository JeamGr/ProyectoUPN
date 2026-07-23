// =================================================================
// CAPA: Domain / Entities
// Ahora contiene UNICAMENTE los campos de autenticacion (tabla
// `usuarios`). Los datos de identidad del voluntario (nombres,
// carrera, etc.) viven en PerfilVoluntario, tabla separada.
// =================================================================

export type EstadoUsuario = 'pendiente_verificacion' | 'activo' | 'bloqueado' | 'eliminado';

export class Usuario {
    constructor(
        public id: number | null,
        public correo: string,
        public passwordHash: string,
        public rolId: number,
        public estado: EstadoUsuario,
        public intentosFallidos: number = 0,
        public fechaBloqueo: Date | null = null,
    ) {}

    puedeIniciarSesion(): boolean {
        return this.estado === 'activo';
    }
    puedeIntentarLogin(maxIntentos: number): boolean {
        return this.intentosFallidos < maxIntentos;
    }

    estaBloqueadoTemporalmente(minutosBloqueo: number): boolean {
        if (this.estado !== 'bloqueado' || !this.fechaBloqueo) return false;
        const transcurrido = Date.now() - this.fechaBloqueo.getTime();
        return transcurrido < minutosBloqueo * 60000;
    }
}