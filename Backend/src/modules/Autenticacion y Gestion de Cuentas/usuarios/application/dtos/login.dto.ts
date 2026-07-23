import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDTO {
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe tener un formato válido' })
    correo!: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    password!: string;
}