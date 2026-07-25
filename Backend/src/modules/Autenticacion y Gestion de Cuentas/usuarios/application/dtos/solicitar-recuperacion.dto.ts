import { IsEmail, IsNotEmpty } from 'class-validator';

export class SolicitarRecuperacionDTO {
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe tener un formato válido' })
    correo!: string;
}