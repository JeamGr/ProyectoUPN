// =================================================================
// CAPA: Application / DTOs
// DTO de entrada para POST /auth/verificar-codigo.
// =================================================================
import { IsInt, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerificarCodigoDTO {
    @IsNotEmpty({ message: 'El id de usuario es obligatorio' })
    @IsInt({ message: 'El id de usuario debe ser numérico' })
    usuarioId!: number;

    @IsNotEmpty({ message: 'El código es obligatorio' })
    @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
    @Matches(/^\d{6}$/, { message: 'El código debe contener solo números' })
    codigo!: string;
}