import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateCourseDto } from "./dto/create-course.dto.js";
import type { ListCoursesQueryDto } from "./dto/list-courses-query.dto.js";
import type { UpdateCourseDto } from "./dto/update-course.dto.js";

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  create(professorId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        code: dto.code,
        name: dto.name,
        term: dto.term,
        professorId,
      },
    });
  }

  findAll(professorId: string, query: ListCoursesQueryDto) {
    return this.prisma.course.findMany({
      where: { professorId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: query.skip,
      take: query.take,
    });
  }

  async findOne(professorId: string, id: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        professorId,
      },
    });
    if (!course) {
      throw new NotFoundException("Asignatura no encontrada.");
    }
    return course;
  }

  async update(professorId: string, id: string, dto: UpdateCourseDto) {
    try {
      return await this.prisma.course.update({
        where: {
          id,
          professorId,
        },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Asignatura no encontrada.");
      }
      throw error;
    }
  }

  async remove(professorId: string, id: string) {
    try {
      await this.prisma.course.delete({
        where: {
          id,
          professorId,
        },
      });
      return { ok: true, id };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Asignatura no encontrada.");
      }
      throw error;
    }
  }
}
