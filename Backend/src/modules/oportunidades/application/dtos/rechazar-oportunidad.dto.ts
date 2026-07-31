import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RechazarOportunidadDTO {
    @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
    @IsString()
    @MinLength(10, { message: 'El motivo debe ser más detallado (mínimo 10 caracteres)' })
    motivoRechazo!: string;
}