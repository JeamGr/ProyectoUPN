import { IsNotEmpty, IsInt, IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';

export class SubirEvidenciaDTO {
    @IsNotEmpty({ message: 'El id de inscripción es obligatorio' })
    @IsInt()
    inscripcionId!: number;

    @IsNotEmpty({ message: 'El tipo de evidencia es obligatorio' })
    @IsEnum(['foto', 'video', 'documento'], { message: 'Tipo inválido' })
    tipo!: 'foto' | 'video' | 'documento';

    @IsOptional() @IsBoolean()
    contenidoSensible?: boolean;

    @IsOptional() @IsString()
    descripcion?: string;
}