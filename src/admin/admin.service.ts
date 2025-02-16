import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import * as Multer from "multer";

import { UserRoles } from "../user/user.schema";
import { UserService } from "../user/user.service";
import { ImageService } from "../image/image.service";
import { CreateProfileEffectDto } from "../image/dtos/create-profile-effect.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: ImageService
  ) {}

  async updateUserBanStatus(
    userId: string,
    isBanned: boolean
  ): Promise<{ success: boolean }> {
    const foundUser = (
      await this.userService.find(
        { _id: new Types.ObjectId(userId) },
        { roles: 1 }
      )
    )[0];
    if (foundUser.roles.includes(UserRoles.ADMIN)) {
      throw new BadRequestException("You cannot ban another admin");
    }

    await this.userService.update(userId, { isBanned });

    return { success: true };
  }

  async uploadProfileEffect(
    title: string,
    files: {
      preview: Express.Multer.File[];
      sides: Express.Multer.File[];
      top?: Express.Multer.File[];
      intro?: Express.Multer.File[];
    }
  ): Promise<{ success: boolean }> {
    try {
      if (
        files.preview === undefined ||
        files.sides === undefined ||
        title === undefined
      ) {
        throw new BadRequestException("Title, preview and sides are required");
      }

      const createProfileEffectDto: CreateProfileEffectDto = {
        title,
        preview: await this.imageService.uploadFileToCloudinary(
          files.preview[0],
          "profile-effect"
        ),
        sides: await this.imageService.uploadFileToCloudinary(
          files.sides[0],
          "profile-effect"
        ),
      };

      if (files.top !== undefined) {
        createProfileEffectDto.top =
          await this.imageService.uploadFileToCloudinary(
            files.top[0],
            "profile-effect"
          );
      }

      if (files.intro !== undefined) {
        createProfileEffectDto.intro =
          await this.imageService.uploadFileToCloudinary(
            files.intro[0],
            "profile-effect"
          );
      }

      await this.imageService.createProfileEffect(createProfileEffectDto);

      return { success: true };
    } catch (error) {
      throw new BadRequestException(
        "Error uploading profile effect: " + error.message
      );
    }
  }
}
