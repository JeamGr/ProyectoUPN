import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class GuardarParametroDTO {
    @IsNotEmpty({ message: 'El valor es obligatorio' })
    @IsString() @MaxLength(500)
    valor!: string;

    @IsOptional() @IsString() @MaxLength(300)
    descripcion?: string;
}
