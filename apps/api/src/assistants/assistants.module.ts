import { Module } from "@nestjs/common";
import { AssistantsService } from "./assistants.service.js";
import { AssistantsController } from "./assistants.controller.js";

@Module({
  controllers: [AssistantsController],
  providers: [AssistantsService],
})
export class AssistantsModule {}
