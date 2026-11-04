import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service.js";
import { AUTH_SETTINGS } from "./auth-settings.js";
import type { AuthSettings } from "./auth-settings.js";
import { subjectFromClaims } from "./auth-user.js";
import type { AuthUser } from "./auth-user.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly users: UsersService,
    @Inject(AUTH_SETTINGS) settings: AuthSettings,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: settings.secret,
      algorithms: ["HS256"],
      issuer: settings.issuer,
      audience: settings.audience,
      ignoreExpiration: false,
    });
  }

  async validate(payload: unknown): Promise<AuthUser> {
    const id = subjectFromClaims(payload);
    if (!id) throw new UnauthorizedException("Identidad inválida.");
    const user = await this.users.findPublicById(id);
    if (!user) throw new UnauthorizedException("Identidad inválida.");
    return { sub: user.id, email: user.email, name: user.name };
  }
}
