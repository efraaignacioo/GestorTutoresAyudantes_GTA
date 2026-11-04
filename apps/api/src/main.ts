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
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  });

  const config = new DocumentBuilder()
    .setTitle("Gestor Tutores Ayudantes API")
    .setDescription("Sistema de gestión de asignaturas, ayudantías y horas")
    .setVersion("4.0")
    .addTag("auth", "Registro, acceso e identidad actual")
    .addTag("courses", "CRUD de asignaturas por usuario autenticado")
    .addTag(
      "assistants",
      "Operaciones sobre ayudantes y asignación de carga horaria",
    )
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .build();

  SwaggerModule.setup(
    "api/docs",
    app,
    () => SwaggerModule.createDocument(app, config),
    {
      jsonDocumentUrl: "api/docs-json",
      swaggerOptions: { persistAuthorization: false },
    },
  );

  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un puerto válido.");
  }
  await app.listen(port);
}
void bootstrap();
