import { IsOptional, IsInt, IsEnum, IsDateString, IsString, Min, Max } from 'class-validator';

export class BuscarOportunidadesDTO {
    @IsOptional() @IsInt()
    lineaIntervencionId?: number;

    @IsOptional()
    @IsEnum(['presencial', 'virtual', 'mixta'])
    modalidad?: 'presencial' | 'virtual' | 'mixta';

    @IsOptional() @IsDateString()
    fechaDesde?: string;

    @IsOptional() @IsDateString()
    fechaHasta?: string;

    @IsOptional() @IsString()
    texto?: string;

    @IsOptional() @IsInt() @Min(1)
    pagina?: number;

    @IsOptional() @IsInt() @Min(1) @Max(50)
    porPagina?: number;
    @IsOptional() @IsString()
    ubicacion?: string;

    @IsOptional() @IsInt() @Min(0)
    horasMin?: number;

    @IsOptional() @IsInt() @Min(0)
    horasMax?: number;

    @IsOptional()
    @IsEnum(['relevancia', 'fecha', 'popularidad'])
    ordenarPor?: 'relevancia' | 'fecha' | 'popularidad';
}