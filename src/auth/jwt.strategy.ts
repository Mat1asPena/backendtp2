import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: config.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: any) {
        // lo que se devuelve acá termina dentro de req.user
        return {
        id: payload.sub,
        username: payload.nombreUsuario, // El token guarda 'nombreUsuario', no 'username'
        profile: payload.perfil,
        };
    }
}
