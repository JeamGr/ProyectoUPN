import { IsNotEmpty, IsString, IsIn, MaxLength, IsOptional } from 'class-validator';

const ACCIONES_VALIDAS = ['crear', 'leer', 'actualizar', 'eliminar'] as const;

export class AsignarPermisoDTO {
    @IsNotEmpty({ message: 'El módulo es obligatorio' })
    @IsString() @MaxLength(80)
    modulo!: string;

    @IsNotEmpty({ message: 'La acción es obligatoria' })
    @IsIn(ACCIONES_VALIDAS, { message: `La acción debe ser una de: ${ACCIONES_VALIDAS.join(', ')}` })
    accion!: 'crear' | 'leer' | 'actualizar' | 'eliminar';
}

export class ActualizarRolDTO {
    @IsOptional() @IsString() @MaxLength(255)
    descripcion?: string;
}
