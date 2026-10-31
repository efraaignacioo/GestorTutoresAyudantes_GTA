import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { CoursesModule } from "./courses/courses.module.js"; // <--- Asegúrate de importarlo

@Module({
  imports: [PrismaModule, AuthModule, CoursesModule], // <--- Inclúyelo aquí
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}