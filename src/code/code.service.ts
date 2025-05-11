import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientSession, Model } from "mongoose";
import { Code, CodeDocument } from "./code.schema";
import { InjectModel } from "@nestjs/mongoose";
import { CODE_LENGTH, CODE_EMAIL_VERIFICATION_TTL } from "src/common/constants";
const { nanoid } = require("fix-esm").require("nanoid");

@Injectable()
export class CodeService implements OnModuleInit {
  constructor(
    @InjectModel(Code.name) private readonly codeModel: Model<Code>
  ) {}

  async onModuleInit() {
    try {
      await this.codeModel.syncIndexes();
    } catch (error) {
      console.error(error);
    }
  }

  async create(
    userId: string,
    type: string,
    session?: ClientSession
  ): Promise<string> {
    const generatedCode = await this.generateUniqueCode();

    const code = new this.codeModel({ userId, code: generatedCode, type });

    await this.codeModel.updateMany({ userId, type }, { isValid: false });
    await code.save({ session });

    return generatedCode;
  }

  async validateCode(code: string): Promise<CodeDocument> {
    const foundCode = await this.codeModel.findOne({ code });
    if (!foundCode || !foundCode.isValid) {
      throw new BadRequestException("Code is invalid");
    }

    const age = Date.now() - foundCode.createdAt.getTime();
    if (age > CODE_EMAIL_VERIFICATION_TTL) {
      throw new BadRequestException("Code has expired");
    }

    return foundCode;
  }

  private async generateUniqueCode(): Promise<string> {
    const maxAttempts = 5; // Prevent infinite loops in extreme edge cases

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const generatedCode = nanoid(CODE_LENGTH);

      const existing = await this.codeModel
        .findOne({ code: generatedCode })
        .lean();
      if (!existing) {
        return generatedCode;
      }
    }

    console.error("[CodeService]: Failed to generate unique user code");
    throw new Error("Failed to generate unique user code");
  }
}
