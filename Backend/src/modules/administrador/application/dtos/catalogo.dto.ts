import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CrearItemCatalogoDTO {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString() @MaxLength(150)
    nombre!: string;

    // Solo se aplica cuando el catálogo destino es "linea_intervencion";
    // en los otros dos catálogos se ignora silenciosamente (ver repository).
    @IsOptional() @IsString() @MaxLength(255)
    icono?: string;
}

export class ActualizarItemCatalogoDTO {
    @IsOptional() @IsString() @MaxLength(150)
    nombre?: string;

    @IsOptional() @IsString() @MaxLength(255)
    icono?: string;
}
