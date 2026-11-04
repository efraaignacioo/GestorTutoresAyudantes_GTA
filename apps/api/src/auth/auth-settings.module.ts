import "dotenv/config";
import { Module } from "@nestjs/common";
import { AUTH_SETTINGS, readAuthSettings } from "./auth-settings.js";

@Module({
  providers: [
    {
      provide: AUTH_SETTINGS,
      useFactory: () => readAuthSettings(process.env),
    },
  ],
  exports: [AUTH_SETTINGS],
})
export class AuthSettingsModule {}
