import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthUser } from "../auth/auth-user.js";
import { CoursesService } from "./courses.service.js";
import { CreateCourseDto } from "./dto/create-course.dto.js";
import { UpdateCourseDto } from "./dto/update-course.dto.js";
import { ListCoursesQueryDto } from "./dto/list-courses-query.dto.js";
// Importa tu DTO de paginación de courses (ej: ListCoursesQueryDto)

@ApiTags("courses")
@ApiBearerAuth("access-token")
@ApiResponse({ status: 401, description: "Token ausente o inválido." })
@UseGuards(JwtAuthGuard)
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.sub, dto);
  }

  @Get()
@Header("Cache-Control", "no-store")
findAll(
  @CurrentUser() user: AuthUser,
  @Query() query: ListCoursesQueryDto,
) {
  return this.coursesService.findAll(user.sub, {
    skip: query.skip,
    take: query.take,
  });
}

  @Get(":id")
  @Header("Cache-Control", "no-store")
  findOne(
    @CurrentUser() user: AuthUser,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
  ) {
    return this.coursesService.findOne(user.sub, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(user.sub, id, dto);
  }

  @Delete(":id")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
  ) {
    return this.coursesService.remove(user.sub, id);
  }
  
}
