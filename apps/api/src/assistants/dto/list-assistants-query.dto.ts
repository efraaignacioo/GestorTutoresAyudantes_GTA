import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListAssistantsQueryDto {
  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    description: "Registros a saltar",
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: "Cantidad de registros a obtener",
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take: number = 20;
}
