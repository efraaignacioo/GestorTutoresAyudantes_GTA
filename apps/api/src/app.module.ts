import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AssistantsModule } from "./assistants/assistants.module.js";
import { CoursesModule } from "./courses/courses.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, CoursesModule, AssistantsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
