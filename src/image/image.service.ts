import * as fs from "fs";
import * as path from "path";

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import * as cloudinary from "cloudinary";
import { Model } from "mongoose";

import { User } from "../user/user.schema";
import { UserAvatar } from "./schemas/user-avatar.schema";
import { UserAvatarMapperService } from "./mappers/user-avatar-mapper";
import { UserAvatarDto } from "./dtos/response/user-avatar-response.dto";

@Injectable()
export class ImageService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserAvatar.name) private userAvatarModel: Model<UserAvatar>,
    private readonly configService: ConfigService,
    private readonly userAvatarMapperService: UserAvatarMapperService
  ) {
    cloudinary.v2.config({
      cloud_name: this.configService.get("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get("CLOUDINARY_API_SECRET"),
    });
  }

  async onModuleInit() {
    try {
      await this.userAvatarModel.syncIndexes();
    } catch (error) {
      console.error(error);
    }
  }

  async uploadAvatar(userId: string, file: any): Promise<UserAvatarDto> {
    if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
      throw new BadRequestException("Invalid file mimetype");
    }

    try {
      const foundUser = await this.userModel.findById(userId);
      if (!foundUser) {
        throw new NotFoundException("User not found");
      }

      if (foundUser.avatarId) {
        const foundAvatar = await this.userAvatarModel.findById(
          foundUser.avatarId
        );
        if (foundAvatar) {
          await this.deleteAvatar(foundAvatar.public_id);
          await foundAvatar.deleteOne();
        }

        foundUser.avatarId = undefined;
      }

      const filename = `${Date.now()}-avatar`;
      const destinationPath = path.join(
        __dirname,
        "..",
        "..",
        "/uploads",
        filename
      );

      await this.saveFileLocal(file.buffer, destinationPath);
      const result = await cloudinary.v2.uploader.upload(destinationPath, {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      await this.deleteFileLocal(destinationPath);

      const newAvatar = await this.userAvatarModel.create({
        userId: foundUser.id,
        url: result.secure_url,
        public_id: result.public_id,
      });

      foundUser.avatarId = newAvatar.id;

      await foundUser.save();

      return this.userAvatarMapperService.toUserAvatar(newAvatar);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async deleteAvatar(avatarId: string): Promise<void> {
    const foundAvatar = await this.userAvatarModel.findById(avatarId);
    if (foundAvatar) {
      await cloudinary.v2.uploader.destroy(foundAvatar.public_id);
      foundAvatar.deleteOne();
    }
  }

  async saveFileLocal(fileData: any, filePath: string): Promise<string> {
    await fs.promises.writeFile(filePath, fileData);
    return filePath;
  }

  async deleteFileLocal(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }
}
