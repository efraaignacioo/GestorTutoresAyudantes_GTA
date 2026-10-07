import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { AssignCourseDto } from "../src/assistants/dto/assign-course.dto.js";
import { CreateTimeLogDto } from "../src/assistants/dto/create-time-log.dto.js";

const validPayload = {
  date: "2026-10-07",
  hours: 2.5,
  description: "Apoyo en laboratorio",
};

describe("CreateTimeLogDto", () => {
  it("accepts valid data with an ISO 8601 date", async () => {
    const dto = plainToInstance(CreateTimeLogDto, validPayload);

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects an ISO date-time when a date-only value is required", async () => {
    const dto = plainToInstance(CreateTimeLogDto, {
      ...validPayload,
      date: "2026-10-07T12:00:00Z",
    });

    const errors = await validate(dto);
    expect(
      errors.find((error) => error.property === "date")?.constraints,
    ).toHaveProperty("matches");
  });

  it("reports validation errors for an invalid date, hours, description and UUID", async () => {
    const dto = plainToInstance(CreateTimeLogDto, {
      ...validPayload,
      date: "2026-02-30",
      hours: 100.123,
      description: "   ",
    });

    const errors = await validate(dto);
    const errorsByProperty = new Map(
      errors.map((error) => [error.property, error.constraints ?? {}]),
    );

    expect(errorsByProperty.get("date")).toHaveProperty("isDateString");
    expect(errorsByProperty.get("hours")).toHaveProperty("max");
    expect(errorsByProperty.get("hours")).toHaveProperty("isNumber");
    expect(errorsByProperty.get("description")).toHaveProperty("isNotEmpty");
  });

  it("returns a 400 validation response for an invalid request body", async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    });

    try {
      await pipe.transform(
        { ...validPayload, date: "not-a-date" },
        { type: "body", metatype: CreateTimeLogDto },
      );
      throw new Error("Expected request validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getResponse()).toMatchObject({
        statusCode: 400,
        message: expect.arrayContaining([expect.stringContaining("date")]),
      });
    }
  });
});

describe("AssignCourseDto enum validation", () => {
  it("rejects statuses outside AssistantStatus", async () => {
    const dto = plainToInstance(AssignCourseDto, {
      courseId: "00000000-0000-4000-8000-000000000000",
      status: "ARCHIVED",
    });

    const errors = await validate(dto);
    expect(
      errors.find((error) => error.property === "status")?.constraints,
    ).toHaveProperty("isEnum");
  });
});
