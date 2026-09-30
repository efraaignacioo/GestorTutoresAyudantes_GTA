import { PartialType } from "@nestjs/swagger";
import { CreateAssistantDto } from "./create-assistant.dto.js";

export class UpdateAssistantDto extends PartialType(CreateAssistantDto) {}
