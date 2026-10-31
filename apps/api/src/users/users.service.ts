import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { SignupDto } from "../auth/dto/signup.dto.js";
import { PasswordService } from "./password.service.js";

const publicUserSelect = { id: true, email: true, name: true } as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async create(dto: SignupDto) {
    const passwordHash = await this.passwords.hash(dto.password);
    try {
      return await this.prisma.user.create({
        data: { email: dto.email, name: dto.name ?? "", passwordHash },
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("El correo ya está registrado.");
      }
      throw error;
    }
  }

  findForLogin(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }
}
