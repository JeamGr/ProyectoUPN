import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGoogleDTO {
    @IsNotEmpty({ message: 'El idToken de Google es obligatorio' })
    @IsString()
    idToken!: string;
}