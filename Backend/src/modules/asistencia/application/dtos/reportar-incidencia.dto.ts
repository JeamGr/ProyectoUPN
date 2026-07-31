import { IsNotEmpty, IsInt, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export class ReportarIncidenciaDTO {
    @IsNotEmpty({ message: 'La oportunidad es obligatoria' })
    @IsInt()
    oportunidadId!: number;

    @IsOptional() @IsInt()
    inscripcionId?: number;

    @IsNotEmpty({ message: 'La categoría es obligatoria' })
    @IsString()
    categoria!: string;

    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @IsString()
    @MinLength(10, { message: 'Describe el incidente con más detalle (mínimo 10 caracteres)' })
    descripcion!: string;

    @IsOptional()
    @IsEnum(['baja', 'media', 'alta', 'critica'])
    severidad?: 'baja' | 'media' | 'alta' | 'critica';
}