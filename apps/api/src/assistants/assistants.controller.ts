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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { AssistantsService } from "./assistants.service.js";
import { AssignCourseDto } from "./dto/assign-course.dto.js";
import { CreateAssistantDto } from "./dto/create-assistant.dto.js";
import { CreateTimeLogDto } from "./dto/create-time-log.dto.js";
import { ListAssistantsQueryDto } from "./dto/list-assistants-query.dto.js";
import { UpdateAssistantDto } from "./dto/update-assistant.dto.js";

@ApiTags("assistants")
@Controller("assistants")
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo ayudante" })
  @ApiCreatedResponse({ description: "Ayudante creado exitosamente" })
  @ApiBadRequestResponse({ description: "Datos de entrada inválidos" })
  @ApiConflictResponse({ description: "El correo ya existe" })
  create(@Body() dto: CreateAssistantDto) {
    return this.assistantsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar ayudantes registrados" })
  @ApiOkResponse({ description: "Listado paginado de ayudantes" })
  @ApiBadRequestResponse({ description: "Paginación inválida" })
  findAll(@Query() query: ListAssistantsQueryDto) {
    return this.assistantsService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtener un ayudante por UUID con sus ramos asignados",
  })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ description: "Ayudante encontrado" })
  @ApiNotFoundResponse({ description: "Ayudante no encontrado" })
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.assistantsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar parcialmente un ayudante" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ description: "Ayudante actualizado" })
  @ApiNotFoundResponse({ description: "Ayudante no encontrado" })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateAssistantDto,
  ) {
    return this.assistantsService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un ayudante" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ description: "Ayudante eliminado" })
  @ApiNotFoundResponse({ description: "Ayudante no encontrado" })
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.assistantsService.remove(id);
  }

  @Post(":id/assignments")
  @ApiOperation({
    summary: "Asignar una asignatura y fijar tope de horas a un ayudante",
  })
  @ApiParam({ name: "id", format: "uuid", description: "UUID del ayudante" })
  @ApiCreatedResponse({ description: "Asignación realizada" })
  @ApiNotFoundResponse({ description: "Ayudante o asignatura no encontrada" })
  @ApiConflictResponse({
    description: "El ayudante ya estaba asignado a este ramo",
  })
  assignCourse(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: AssignCourseDto,
  ) {
    return this.assistantsService.assignCourse(id, dto);
  }

  @Get(":id/assignments")
  @ApiOperation({
    summary: "Consultar las asignaciones y bitácora de horas del ayudante",
  })
  @ApiParam({ name: "id", format: "uuid", description: "UUID del ayudante" })
  @ApiOkResponse({ description: "Listado de asignaciones del ayudante" })
  @ApiNotFoundResponse({ description: "Ayudante no encontrado" })
  getAssignments(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.assistantsService.getAssignments(id);
  }

  @Post(":id/assignments/:assignmentId/time-logs")
  @ApiOperation({ summary: "Registrar horas trabajadas en una asignación" })
  @ApiParam({ name: "id", format: "uuid", description: "UUID del ayudante" })
  @ApiParam({
    name: "assignmentId",
    format: "uuid",
    description: "UUID de la asignación",
  })
  @ApiCreatedResponse({ description: "Registro de horas creado" })
  @ApiBadRequestResponse({
    description: "UUID, fecha, horas o descripción inválidos",
  })
  @ApiNotFoundResponse({ description: "Ayudante o asignación no encontrada" })
  createTimeLog(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Param("assignmentId", new ParseUUIDPipe({ version: "4" }))
    assignmentId: string,
    @Body() dto: CreateTimeLogDto,
  ) {
    return this.assistantsService.createTimeLog(id, assignmentId, dto);
  }
}
