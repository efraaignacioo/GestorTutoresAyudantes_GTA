import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { AssistantStatus } from "../../generated/prisma/enums.js";

export class AssignCourseDto {
  @ApiProperty({
    example: "00000000-0000-0000-0000-000000000000",
    description: "UUID de la asignatura (Course)",
  })
  @IsUUID("4")
  @IsNotEmpty()
  courseId!: string;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 80,
    description: "Tope de horas mensuales asignadas",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(80)
  maxHours?: number;

  @ApiPropertyOptional({
    enum: AssistantStatus,
    enumName: "AssistantStatus",
    default: AssistantStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AssistantStatus)
  status?: AssistantStatus;
}
