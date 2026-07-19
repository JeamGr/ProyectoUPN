// =================================================================
// CAPA: Application / DTOs
// DTO de entrada para POST /auth/reenviar-codigo.
// =================================================================
import { IsInt, IsNotEmpty } from 'class-validator';

export class ReenviarCodigoDTO {
    @IsNotEmpty({ message: 'El id de usuario es obligatorio' })
    @IsInt({ message: 'El id de usuario debe ser numérico' })
    usuarioId!: number;
}