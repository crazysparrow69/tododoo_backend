import * as fs from "fs";
import * as path from "path";

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import * as cloudinary from "cloudinary";
import mongoose, { ClientSession, Model } from "mongoose";

import { User } from "../user/user.schema";
import { CloudinaryMedia } from "./interfaces/cloudinary";
import { ProfileEffect, UserAvatar, UserAvatarEffect } from "./schemas";
import {
  ProfileEffectMapperService,
  UserAvatarEffectMapperService,
  UserAvatarMapperService,
} from "./mappers";
import {
  CreateProfileEffectDto,
  CreateUserAvatarEffectDto,
  ProfileEffectFullResponseDto,
  UserAvatarDto,
  UserAvatarEffectFullResponseDto,
} from "./dtos";
import { transaction } from "src/common/transaction";

@Injectable()
export class ImageService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserAvatar.name) private userAvatarModel: Model<UserAvatar>,
    @InjectModel(ProfileEffect.name)
    private profileEffectModel: Model<ProfileEffect>,
    @InjectModel(UserAvatarEffect.name)
    private userAvatarEffectModel: Model<UserAvatarEffect>,
    private readonly configService: ConfigService,
    private readonly userAvatarMapperService: UserAvatarMapperService,
    private readonly profileEffectMapperService: ProfileEffectMapperService,
    private readonly userAvatarEffectMapperService: UserAvatarEffectMapperService,
    @InjectConnection() private readonly connection: mongoose.Connection
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
        this.userAvatarEffectModel.syncIndexes(),
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
      const result = await transaction<{
        newAvatar: UserAvatar;
        foundAvatarId?: string;
      }>(this.connection, async (session) => {
        const foundUser = await this.userModel.findById(userId);
        if (!foundUser) {
          throw new NotFoundException("User not found");
        }

        const uploadedAvatar = await this.uploadFileToCloudinary(file);

        const newAvatar = await this.userAvatarModel.create({
          userId: foundUser.id,
          ...uploadedAvatar,
        });

        const result: { newAvatar: UserAvatar; foundAvatarId?: string } = {
          newAvatar,
        };

        if (foundUser.avatarId) {
          const foundAvatar = await this.userAvatarModel.findById(
            foundUser.avatarId
          );
          if (foundAvatar) {
            await foundAvatar.deleteOne({ session });

            result.foundAvatarId = foundAvatar.id;
          }
        }

        foundUser.avatarId = newAvatar.id;

        await foundUser.save({ session });

        return result;
      });

      if (result.foundAvatarId) {
        await this.deleteAvatarFromCloudinary(result.foundAvatarId);
      }

      return this.userAvatarMapperService.toUserAvatar(result.newAvatar);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  createProfileEffect(createProfileEffectDto: CreateProfileEffectDto) {
    return this.profileEffectModel.create(createProfileEffectDto);
  }

  async findProfileEffects(): Promise<ProfileEffectFullResponseDto[]> {
    const profileEffects = await this.profileEffectModel
      .find()
      .sort({ createdAt: -1 });

    return this.profileEffectMapperService.toProfileEffectsFull(profileEffects);
  }

  createUserAvatarEffect(createUserAvatarEffectDto: CreateUserAvatarEffectDto) {
    return this.userAvatarEffectModel.create(createUserAvatarEffectDto);
  }

  async findUserAvatarEffects(): Promise<UserAvatarEffectFullResponseDto[]> {
    const userAvatarEffects = await this.userAvatarEffectModel
      .find()
      .sort({ createdAt: -1 });

    return this.userAvatarEffectMapperService.toUserAvatarEffectsFull(
      userAvatarEffects
    );
  }

  async uploadFileToCloudinary(
    file: any,
    name?: string
  ): Promise<CloudinaryMedia> {
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

  async deleteAvatarFromCloudinary(public_id: string): Promise<void> {
    await cloudinary.v2.uploader.destroy(public_id);
  }

  async saveFileLocal(fileData: any, filePath: string): Promise<string> {
    await fs.promises.writeFile(filePath, fileData);
    return filePath;
  }

  async deleteFileLocal(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }
}
