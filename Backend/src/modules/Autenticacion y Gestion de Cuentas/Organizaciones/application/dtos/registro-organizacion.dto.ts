import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsInt, IsEnum, MaxLength } from 'class-validator';

export class RegistroOrganizacionDTO {
    @IsNotEmpty({ message: 'El nombre de la ONG es obligatorio' })
    @IsString() @MaxLength(200)
    nombreOng!: string;

    @IsOptional() @IsString()
    descripcionActividad?: string;

    @IsOptional() @IsInt()
    lineaIntervencionId?: number;

    @IsOptional() @IsInt()
    categoriaId?: number;

    @IsOptional() @IsString()
    pais?: string;

    @IsNotEmpty({ message: 'La dirección es obligatoria' })
    @IsString()
    direccion!: string;

    @IsNotEmpty({ message: 'La persona de contacto es obligatoria' })
    @IsString()
    personaContacto!: string;

    @IsNotEmpty()
    @IsEnum(['DNI', 'CE', 'PASAPORTE'], { message: 'Tipo de documento inválido' })
    tipoDocumentoContacto!: 'DNI' | 'CE' | 'PASAPORTE';

    @IsNotEmpty({ message: 'El número de documento es obligatorio' })
    @IsString()
    numeroDocumentoContacto!: string;

    @IsNotEmpty({ message: 'El celular de contacto es obligatorio' })
    @IsString()
    celularContacto!: string;

    @IsOptional() @IsString()
    linkWeb?: string;

    @IsNotEmpty({ message: 'El link de redes sociales es obligatorio' })
    @IsString()
    linkRedesSociales!: string;

    @IsNotEmpty()
    @IsEnum(['SI', 'NO', 'EN_PROCESO'], { message: 'Valor inválido' })
    constituidaLegalmente!: 'SI' | 'NO' | 'EN_PROCESO';

    @IsNotEmpty({ message: 'El RUC es obligatorio' })
    @IsString()
    ruc!: string;

    @IsNotEmpty({ message: 'La razón social es obligatoria' })
    @IsString()
    razonSocial!: string;

    @IsOptional() @IsString()
    numeroBeneficiariosAnual?: string;

    @IsNotEmpty()
    @IsEnum(['SI', 'NO', 'EN_PROCESO'], { message: 'Valor inválido' })
    tieneCertificadoDonacion!: 'SI' | 'NO' | 'EN_PROCESO';

    @IsOptional()
    @IsEnum(['SI', 'NO', 'EN_PROCESO'])
    tieneProgramaVoluntariadoCorporativo?: 'SI' | 'NO' | 'EN_PROCESO';

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'Correo inválido' })
    correo!: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password!: string;

    @IsNotEmpty({ message: 'Debes confirmar la contraseña' })
    confirmarPassword!: string;
}