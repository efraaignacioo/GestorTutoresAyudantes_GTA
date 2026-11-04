import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ThrottlerModule } from "@nestjs/throttler";
import { UsersModule } from "../users/users.module.js";
import { AUTH_SETTINGS } from "./auth-settings.js";
import type { AuthSettings } from "./auth-settings.js";
import { AuthSettingsModule } from "./auth-settings.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./jwt.strategy.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";

@Module({
  imports: [
    UsersModule,
    AuthSettingsModule,
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    JwtModule.registerAsync({
      imports: [AuthSettingsModule],
      inject: [AUTH_SETTINGS],
      useFactory: (settings: AuthSettings) => ({
        secret: settings.secret,
        signOptions: {
          algorithm: "HS256" as const,
          expiresIn: settings.expiresIn,
          issuer: settings.issuer,
          audience: settings.audience,
        },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, PassportModule],
})
export class AuthModule {}
