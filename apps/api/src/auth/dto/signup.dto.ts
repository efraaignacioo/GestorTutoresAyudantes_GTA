import { Transform } from "class-transformer";
import {
  IsByteLength,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SignupDto {
  @ApiProperty({ example: "alicia@example.test", maxLength: 254 })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    minLength: 15,
    maxLength: 72,
    writeOnly: true,
    description: "Sin recortar. Máximo 72 bytes UTF-8.",
  })
  @IsString()
  @MinLength(15)
  @MaxLength(72)
  @IsByteLength(1, 72)
  password!: string;

  @ApiPropertyOptional({ maxLength: 80, nullable: true })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string | null;
}
