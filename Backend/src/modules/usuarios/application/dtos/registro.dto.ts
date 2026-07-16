// =================================================================
// CAPA: Application / DTOs
// DTO de entrada para POST /auth/registro.
// =================================================================
import {
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
    IsArray,
    ArrayNotEmpty,
    ValidateIf,
} from 'class-validator';

export class RegistroDTO {
    @IsNotEmpty({ message: 'El código de estudiante es obligatorio' })
    @Matches(/^UPN\d{4}-\d{4,6}$/, { message: 'El código de estudiante no tiene el formato esperado' })
    codigoEstudiante!: string;

    @IsNotEmpty({ message: 'Los nombres son obligatorios' })
    @IsString()
    @MaxLength(100)
    nombres!: string;

    @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
    @IsString()
    @MaxLength(100)
    apellidos!: string;

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe tener un formato válido' })
    email!: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password!: string;

    @IsNotEmpty({ message: 'Debes confirmar la contraseña' })
    confirmarPassword!: string;

    @IsNotEmpty({ message: 'La carrera es obligatoria' })
    @IsString()
    carrera!: string;

    @IsNotEmpty({ message: 'El ciclo es obligatorio' })
    @IsInt({ message: 'El ciclo debe ser un número' })
    @Min(1)
    @Max(12)
    ciclo!: number;

    @IsArray({ message: 'Los intereses deben ser una lista' })
    @ArrayNotEmpty({ message: 'Selecciona al menos un interés' })
    @IsInt({ each: true, message: 'Cada interés debe ser un id numérico' })
    intereses!: number[];

    // Validación cruzada: solo se activa si ambos campos ya llegaron.
    @ValidateIf((o) => o.password !== undefined && o.confirmarPassword !== undefined)
    @Matches(/.*/, { message: 'Las contraseñas no coinciden' })
    get passwordsCoinciden() {
        return this.password === this.confirmarPassword ? 'ok' : '';
    }
}