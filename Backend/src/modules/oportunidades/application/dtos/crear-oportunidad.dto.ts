import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional, IsDateString, IsBoolean, Min, MaxLength } from 'class-validator';

export class CrearOportunidadDTO {
    @IsNotEmpty({ message: 'El título es obligatorio' })
    @IsString() @MaxLength(200)
    titulo!: string;

    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @IsString()
    descripcion!: string;

    @IsNotEmpty({ message: 'La línea de intervención es obligatoria' })
    @IsInt()
    lineaIntervencionId!: number;

    @IsNotEmpty({ message: 'La modalidad es obligatoria' })
    @IsEnum(['presencial', 'virtual', 'mixta'], { message: 'Modalidad inválida' })
    modalidad!: 'presencial' | 'virtual' | 'mixta';

    @IsOptional() @IsString()
    ubicacion?: string;

    @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
    @IsDateString({}, { message: 'Fecha de inicio inválida' })
    fechaInicio!: string;

    @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
    @IsDateString({}, { message: 'Fecha de fin inválida' })
    fechaFin!: string;

    @IsNotEmpty({ message: 'Las horas acreditadas son obligatorias' })
    @IsInt() @Min(0)
    horasAcreditadas!: number;

    @IsNotEmpty({ message: 'Los cupos totales son obligatorios' })
    @IsInt() @Min(1)
    cuposTotales!: number;

    @IsOptional() @IsString()
    requisitos?: string;

    @IsOptional() @IsString()
    imagenUrl?: string;

    @IsOptional() @IsBoolean()
    requiereAprobacion?: boolean;
}