import "dotenv/config";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateCourseDto } from "./dto/create-course.dto.js";
import { ListCoursesQueryDto } from "./dto/list-courses-query.dto.js";
import { UpdateCourseDto } from "./dto/update-course.dto.js";

@Injectable()
export class CoursesService {
  private readonly professorId: string;

  constructor(private readonly prisma: PrismaService) {
    const professorId = process.env.DEMO_PROFESSOR_ID;
    if (!professorId) {
      throw new Error("DEMO_PROFESSOR_ID no está definida");
    }
    this.professorId = professorId;
  }

  create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        code: dto.code,
        name: dto.name,
        term: dto.term,
        professorId: this.professorId,
      },
    });
  }

  findAll(query: ListCoursesQueryDto) {
    return this.prisma.course.findMany({
      where: { professorId: this.professorId },
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take,
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        professorId: this.professorId,
      },
    });

    if (!course) {
      throw new NotFoundException("Asignatura no encontrada");
    }

    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.findOne(id);
    return this.prisma.course.update({
      where: {
        id,
        professorId: this.professorId,
      },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.course.delete({
      where: {
        id,
        professorId: this.professorId,
      },
    });
    return { ok: true, id };
  }
}
