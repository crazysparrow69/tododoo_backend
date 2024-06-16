import * as fs from "fs";
import * as path from "path";

import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
// eslint-disable-next-line
import * as cloudinary from "cloudinary";
import { Model } from "mongoose";

import { Avatar } from "../user/user.interface";
import { User } from "../user/user.schema";

@Injectable()
export class ImageService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    // eslint-disable-next-line
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadAvatar(userId: string, file: any): Promise<Avatar> {
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
      // eslint-disable-next-line
      const result = await cloudinary.v2.uploader.upload(destinationPath, {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      this.deleteFileLocal(destinationPath);

      await this.userModel.findByIdAndUpdate(userId, {
        avatar: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });

      return { url: result.secure_url, public_id: result.public_id };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  deleteAvatar(publicId: string): Promise<void> {
    // eslint-disable-next-line
    return cloudinary.v2.uploader.destroy(publicId);
  }

  saveFileLocal(fileData: any, filePath: string): string {
    try {
      fs.writeFileSync(filePath, fileData);
      return filePath;
    } catch (err) {
      throw err;
    }
  }

  deleteFileLocal(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        throw err;
      }
    });
  }
}
