import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AssignCourseDto } from "./dto/assign-course.dto.js";
import { CreateAssistantDto } from "./dto/create-assistant.dto.js";
import { ListAssistantsQueryDto } from "./dto/list-assistants-query.dto.js";
import { UpdateAssistantDto } from "./dto/update-assistant.dto.js";

@Injectable()
export class AssistantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssistantDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(
        "Ya existe un usuario con este correo electrónico",
      );
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: dto.password, // En la fase de Auth se aplicará hashing
        role: "ASSISTANT",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  findAll(query: ListAssistantsQueryDto) {
    return this.prisma.user.findMany({
      where: { role: "ASSISTANT" },
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const assistant = await this.prisma.user.findFirst({
      where: { id, role: "ASSISTANT" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignments: {
          include: {
            course: {
              select: { id: true, code: true, name: true, term: true },
            },
          },
        },
        createdAt: true,
      },
    });

    if (!assistant) {
      throw new NotFoundException("Ayudante no encontrado");
    }
    return assistant;
  }

  async update(id: string, dto: UpdateAssistantDto) {
    await this.findOne(id);

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(
          "El correo ya está en uso por otro usuario",
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        name: dto.name,
        ...(dto.password ? { passwordHash: dto.password } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { ok: true, id };
  }

  async assignCourse(assistantId: string, dto: AssignCourseDto) {
    await this.findOne(assistantId);

    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new NotFoundException("La asignatura indicada no existe");
    }

    const existingAssignment = await this.prisma.courseAssistant.findUnique({
      where: {
        courseId_assistantId: {
          courseId: dto.courseId,
          assistantId,
        },
      },
    });
    if (existingAssignment) {
      throw new ConflictException(
        "El ayudante ya está asignado a esta asignatura",
      );
    }

    return this.prisma.courseAssistant.create({
      data: {
        assistantId,
        courseId: dto.courseId,
        maxHours: dto.maxHours ?? 20,
        status: dto.status ?? "ACTIVE",
      },
      include: {
        course: { select: { id: true, code: true, name: true, term: true } },
      },
    });
  }

  async getAssignments(assistantId: string) {
    await this.findOne(assistantId);
    return this.prisma.courseAssistant.findMany({
      where: { assistantId },
      include: {
        course: { select: { id: true, code: true, name: true, term: true } },
        timeLogs: true,
      },
    });
  }
}
