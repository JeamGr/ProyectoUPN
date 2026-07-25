import { IsNotEmpty, IsString, MinLength, IsInt } from 'class-validator';

export class ConfirmarRecuperacionDTO {
    @IsNotEmpty({ message: 'El usuarioId es obligatorio' })
    @IsInt()
    usuarioId!: number;

    @IsNotEmpty({ message: 'El token es obligatorio' })
    @IsString()
    token!: string;

    @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    passwordNueva!: string;
}