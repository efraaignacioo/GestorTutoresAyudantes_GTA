import { randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { OnModuleInit } from "@nestjs/common";
import bcrypt from "bcrypt";

@Injectable()
export class PasswordService implements OnModuleInit {
  private dummyHash = "";

  async onModuleInit() {
    this.dummyHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
  }

  hash(password: string) {
    return bcrypt.hash(password, 12);
  }

  async verify(password: string, hash: string | undefined): Promise<boolean> {
    const validHash = hash !== undefined && /^\$2[aby]\$\d{2}\$/.test(hash);
    const matches = await bcrypt.compare(
      password,
      validHash ? hash : this.dummyHash,
    );
    return validHash && matches;
  }
}
