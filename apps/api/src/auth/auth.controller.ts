import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service.js";
import { SignupDto } from "./dto/signup.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { CurrentUser } from "./current-user.decorator.js";
import type { AuthUser } from "./auth-user.js";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup")
  @UseGuards(ThrottlerGuard)
  @Header("Cache-Control", "no-store")
  @ApiResponse({ status: 201, description: "Cuenta creada y token emitido." })
  @ApiResponse({ status: 409, description: "Correo registrado." })
  @ApiResponse({ status: 429, description: "Demasiados intentos." })
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Post("login")
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Header("Cache-Control", "no-store")
  @ApiResponse({ status: 200, description: "Token emitido." })
  @ApiResponse({ status: 401, description: "Credenciales inválidas." })
  @ApiResponse({ status: 429, description: "Demasiados intentos." })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @Header("Cache-Control", "no-store")
  @ApiResponse({
    status: 200,
    description: "Identidad actual: sub, email y name.",
  })
  @ApiResponse({ status: 401, description: "Token ausente o inválido." })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
