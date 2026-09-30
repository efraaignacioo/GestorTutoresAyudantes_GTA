import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAssistantDto {
  @ApiProperty({
    example: "ignacio.ayudante@utalca.cl",
    description: "Correo institucional del ayudante",
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: "Ignacio Guerra",
    description: "Nombre completo del ayudante",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: "temporal123",
    description: "Contraseña inicial provisoria",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
