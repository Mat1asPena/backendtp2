import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, Matches, IsOptional, IsIn, MaxLength, min, Min, MinDate } from 'class-validator';

export class RegisterDto {
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @IsNotEmpty() nombre: string;

    @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    @IsNotEmpty() apellido: string;

    @IsEmail() correo: string;

    @MinLength(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres' })
    @IsNotEmpty() nombreUsuario: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(50, { message: 'La contraseña no puede exceder los 20 caracteres' })
    @Matches(/(?=.*[A-Z])(?=.*\d).+/, { message: 'La contraseña debe tener 1 mayúscula y 1 número' }) password: string;

    @Type(() => Date)
    @MinDate(new Date('1900-01-01'), { message: 'La fecha de nacimiento debe ser posterior al 1 de enero de 1900' })
    @IsOptional() fechaNacimiento?: string;

    @MaxLength(200, { message: 'La descripción no puede exceder los 200 caracteres' })
    @IsOptional() descripcion?: string;

    @IsOptional() @IsIn(['usuario', 'administrador']) perfil?: 'usuario' | 'administrador';
}
