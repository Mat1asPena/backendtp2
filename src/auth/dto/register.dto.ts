import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, Matches, IsOptional, IsIn, MaxLength, min, Min, MinDate, max, Max } from 'class-validator';

export class RegisterDto {
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(747, { message: 'El nombre no puede exceder los 747 caracteres' })
    @IsNotEmpty() nombre: string;

    @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    @MaxLength(747, { message: 'El apellido no puede exceder los 747 caracteres' })
    @IsNotEmpty() apellido: string;

    @MinLength(5, { message: 'El correo debe tener al menos 5 caracteres' })
    @MaxLength(50, { message: 'El correo no puede exceder los 100 caracteres' })
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
