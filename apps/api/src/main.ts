import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  });

  // Dentro de openApiConfig en apps/api/src/main.ts:
  const openApiConfig = new DocumentBuilder()
    .setTitle("Gestor Tutores Ayudantes API")
    .setDescription(
      "API REST del sistema de gestión de ayudantías y seguimiento de horas",
    )
    .setVersion("2.0")
    .addTag("courses", "Operaciones sobre asignaturas y ramos")
    .addTag(
      "assistants",
      "Operaciones sobre ayudantes y asignación de carga horaria",
    )
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("api/docs", app, documentFactory, {
    jsonDocumentUrl: "api/docs-json",
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}
void bootstrap();
