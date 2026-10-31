import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service.js";
import { UsersService } from "./users.service.js";

@Module({
  providers: [PasswordService, UsersService],
  exports: [PasswordService, UsersService],
})
export class UsersModule {}
