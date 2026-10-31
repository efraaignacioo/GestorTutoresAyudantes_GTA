import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service.js";
import { PasswordService } from "../users/password.service.js";
import { AUTH_SETTINGS } from "./auth-settings.js";
import type { AuthSettings } from "./auth-settings.js";
import type { SignupDto } from "./dto/signup.dto.js";
import type { LoginDto } from "./dto/login.dto.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    @Inject(AUTH_SETTINGS) private readonly settings: AuthSettings,
  ) {}

  private async issue(id: string) {
    return {
      access_token: await this.jwt.signAsync({ sub: id }),
      token_type: "Bearer" as const,
      expires_in: this.settings.expiresIn,
    };
  }

  async signup(dto: SignupDto) {
    const user = await this.users.create(dto);
    return this.issue(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findForLogin(dto.email);
    const matches = await this.passwords.verify(
      dto.password,
      user?.passwordHash,
    );
    if (!user || !matches)
      throw new UnauthorizedException("Credenciales inválidas.");
    return this.issue(user.id);
  }
}
