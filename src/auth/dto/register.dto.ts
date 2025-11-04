import { IsEmail, IsNotEmpty, MinLength, Matches, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty() nombre: string;
    @IsNotEmpty() apellido: string;
    @IsEmail() correo: string;
    @IsNotEmpty() nombreUsuario: string;

    @IsNotEmpty()
    @MinLength(8)
    @Matches(/(?=.*[A-Z])(?=.*\d).+/, { message: 'La contraseña debe tener 1 mayúscula y 1 número' })
    password: string;

    @IsOptional() fechaNacimiento?: string;
    @IsOptional() descripcion?: string;
    @IsOptional() @IsIn(['usuario', 'administrador']) perfil?: 'usuario' | 'administrador';
}
