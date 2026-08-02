import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RechazarOrganizacionDTO {
    @IsNotEmpty({ message: 'El motivo del rechazo es obligatorio' })
    @IsString()
    @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
    @MaxLength(500)
    motivoRechazo!: string;
}