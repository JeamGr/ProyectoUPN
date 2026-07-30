import { IsNotEmpty, IsEnum } from 'class-validator';

export class ActualizarEstadoIncidenciaDTO {
    @IsNotEmpty({ message: 'El estado es obligatorio' })
    @IsEnum(['en_seguimiento', 'resuelta', 'cerrada'], { message: 'Estado inválido' })
    estado!: 'en_seguimiento' | 'resuelta' | 'cerrada';
}