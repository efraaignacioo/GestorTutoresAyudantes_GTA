import { Transform } from "class-transformer";
import {
  IsByteLength,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "alicia@example.test" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ writeOnly: true, maxLength: 72 })
  @IsString()
  @MaxLength(72)
  @MinLength(1)
  @IsByteLength(1, 72)
  password!: string;
}
