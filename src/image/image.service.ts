import * as fs from "fs";
import * as path from "path";

import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
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
    private readonly userAvatarMapperService: UserAvatarMapperService,
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

    const filename = `${Date.now()}-avatar`;
    const destinationPath = path.join(
      __dirname,
      "..",
      "..",
      "/uploads",
      filename
    );

    const foundUser = await this.userModel.findById(userId);
    const publicId = foundUser.avatar?.public_id;

    if (publicId) {
      this.deleteAvatar(publicId);
    }

    try {
      this.saveFileLocal(file.buffer, destinationPath);

      const result = await cloudinary.v2.uploader.upload(destinationPath, {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      this.deleteFileLocal(destinationPath);

      const newAvatar = await this.userAvatarModel.create({
        userId: foundUser.id,
        url: result.secure_url,
        public_id: result.public_id
      });

      await this.userModel.findByIdAndUpdate(userId, {
        avatar: newAvatar.id,
      });

      return this.userAvatarMapperService.toUserAvatar(newAvatar);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  deleteAvatar(publicId: string): Promise<void> {
    return cloudinary.v2.uploader.destroy(publicId);
  }

  saveFileLocal(fileData: any, filePath: string): string {
    fs.writeFileSync(filePath, fileData);
    return filePath;
  }

  deleteFileLocal(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        throw err;
      }
    });
  }
}
