import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class RegistrarAsistenciaDTO {
    @IsNotEmpty({ message: 'El id de inscripción es obligatorio' })
    @IsInt()
    inscripcionId!: number;

    @IsNotEmpty({ message: 'El estado es obligatorio' })
    @IsEnum(['presente', 'ausente', 'tardanza'], { message: 'Estado inválido' })
    estado!: 'presente' | 'ausente' | 'tardanza';
}