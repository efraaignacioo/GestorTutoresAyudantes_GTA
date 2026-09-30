import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CoursesService } from "./courses.service.js";
import { CreateCourseDto } from "./dto/create-course.dto.js";
import { ListCoursesQueryDto } from "./dto/list-courses-query.dto.js";
import { UpdateCourseDto } from "./dto/update-course.dto.js";

@ApiTags("courses")
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: "Crear una asignatura o ramo" })
  @ApiCreatedResponse({ description: "Asignatura creada" })
  @ApiBadRequestResponse({ description: "Cuerpo de solicitud inválido" })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar asignaturas del docente" })
  @ApiOkResponse({ description: "Listado paginado de asignaturas" })
  @ApiBadRequestResponse({ description: "Parámetros de paginación inválidos" })
  findAll(@Query() query: ListCoursesQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una asignatura por UUID" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ description: "Asignatura encontrada" })
  @ApiBadRequestResponse({ description: "UUID inválido" })
  @ApiNotFoundResponse({ description: "Asignatura no encontrada" })
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar parcialmente una asignatura" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ description: "Asignatura actualizada" })
  @ApiBadRequestResponse({ description: "UUID o cuerpo de solicitud inválido" })
  @ApiNotFoundResponse({ description: "Asignatura no encontrada" })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar una asignatura" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ description: "Asignatura eliminada" })
  @ApiBadRequestResponse({ description: "UUID inválido" })
  @ApiNotFoundResponse({ description: "Asignatura no encontrada" })
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.coursesService.remove(id);
  }
}
