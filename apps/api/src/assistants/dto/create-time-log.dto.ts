import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
} from "class-validator";

export class CreateTimeLogDto {
  @ApiProperty({
    example: "2026-10-07",
    format: "date",
    description: "Fecha trabajada en formato ISO 8601 (YYYY-MM-DD)",
  })
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @ApiProperty({
    example: 2.5,
    minimum: 0.01,
    maximum: 99.99,
    description: "Horas trabajadas, con hasta dos decimales",
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99.99)
  hours!: number;

  @ApiProperty({
    example: "Preparación de material y apoyo en laboratorio",
    description: "Detalle de las labores realizadas",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  description!: string;
}
