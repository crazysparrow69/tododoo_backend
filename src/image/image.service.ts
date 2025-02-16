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
import { CreateProfileEffectDto } from "./dtos/create-profile-effect.dto";
import { ProfileEffect } from "./schemas/profile-effect.schema";
import { CloudinaryMedia } from "./interfaces/cloudinary";
import { ProfileEffectResponseDto } from "./dtos/response/profile-effect-response.dto";
import { ProfileEffectMapperService } from "./mappers/profile-effect-mapper";

@Injectable()
export class ImageService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserAvatar.name) private userAvatarModel: Model<UserAvatar>,
    @InjectModel(ProfileEffect.name)
    private profileEffectModel: Model<ProfileEffect>,
    private readonly configService: ConfigService,
    private readonly userAvatarMapperService: UserAvatarMapperService,
    private readonly profileEffectMapperService: ProfileEffectMapperService
  ) {
    cloudinary.v2.config({
      cloud_name: this.configService.get("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get("CLOUDINARY_API_SECRET"),
    });
  }

  async onModuleInit() {
    try {
      await Promise.all([
        this.userAvatarModel.syncIndexes(),
        this.profileEffectModel.syncIndexes(),
      ]);
    } catch (error) {
      console.error("Error syncing indexes:", error);
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
          await this.deleteAvatar(foundAvatar._id.toString());
          await foundAvatar.deleteOne();
        }

        foundUser.avatarId = undefined;
      }

      const result = await this.uploadFileToCloudinary(file);

      const newAvatar = await this.userAvatarModel.create({
        userId: foundUser.id,
        ...result
      });

      foundUser.avatarId = newAvatar.id;

      await foundUser.save();

      return this.userAvatarMapperService.toUserAvatar(newAvatar);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  createProfileEffect(createProfileEffectDto: CreateProfileEffectDto) {
    return this.profileEffectModel.create(createProfileEffectDto);
  }

  async findProfileEffects(): Promise<ProfileEffectResponseDto[]> {
    const profileEffects = await this.profileEffectModel.find();

    return this.profileEffectMapperService.toProfileEffectsFull(profileEffects);
  }

  async uploadFileToCloudinary(file: any, name?: string): Promise<CloudinaryMedia> {
    let filename = `${Date.now()}`;
    if (name) {
      filename = filename + "-" + name;
    }

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

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
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
