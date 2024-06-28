import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ProjectionType, Types } from "mongoose";
import { SignupUserDto } from "src/auth/dtos";
import { Task } from "src/task/schemas";

import {
  ChangePasswordDto,
  QueryUserDto,
  UserBaseDto,
  UserProfileDto,
} from "./dtos";
import { UserMapperService } from "./user-mapper.service";
import { User } from "./user.schema";
import { Category } from "../category/category.schema";
import { ImageService } from "../image/image.service";

const scrypt = promisify(_scrypt);

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private imageService: ImageService,
    private userMapperService: UserMapperService
  ) {}

  async onModuleInit() {
    try {
      await this.userModel.syncIndexes();
    } catch (error) {
      console.error(error);
    }
  }

  async getUserProfile(id: string): Promise<UserProfileDto> {
    const foundUser = await this.userModel
      .findById(id, {
        _id: 1,
        username: 1,
        email: 1,
        "avatar.url": 1,
        createdAt: 1,
      })
      .lean();
    if (!foundUser) throw new NotFoundException("User not found");

    return this.userMapperService.toUserProfile(foundUser);
  }

  async getUserPublicProfile(id: string): Promise<UserBaseDto> {
    const foundUser = await this.userModel
      .findById(new Types.ObjectId(id), {
        _id: 1,
        username: 1,
        "avatar.url": 1,
        createdAt: 1,
      })
      .lean();
    if (!foundUser) throw new NotFoundException("User not found");

    return this.userMapperService.toUserBase(foundUser);
  }

  async findUsersByUsername({
    username,
    page = 1,
    limit = 10,
  }: QueryUserDto): Promise<{
    foundUsers: UserBaseDto[];
    page: number;
    totalPages: number;
  }> {
    const query = {
      username: { $regex: username, $options: "i" },
    };

    const count = await this.userModel.countDocuments(query);
    if (count === 0) {
      return {
        foundUsers: [],
        page: 0,
        totalPages: 0,
      };
    }

    const foundUsers = await this.userModel
      .find(query, { username: 1, "avatar.url": 1 })
      .lean()
      .limit(limit)
      .skip((page - 1) * limit)
      .sort("username")
      .exec();

    const totalPages = Math.ceil(count / limit);

    return {
      foundUsers: this.userMapperService.toUsersBase(foundUsers),
      page,
      totalPages,
    };
  }

  async create(createUserDto: SignupUserDto): Promise<User> {
    const foundUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (foundUser) {
      throw new BadRequestException("Email already in use");
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    return this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async update(id: string, attrs: Partial<User>): Promise<UserProfileDto> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, attrs, {
        new: true,
      })
      .lean()
      .select(["_id", "username", "email", "avatar.url", "createdAt"]);
    if (!updatedUser) throw new NotFoundException("User not found");

    return this.userMapperService.toUserProfile(updatedUser);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const deletedUser = await this.userModel
      .findByIdAndDelete(id, {
        "avatar.public_id": 1,
      })
      .lean();
    const avatarPublicId = deletedUser.avatar?.public_id;
    if (!deletedUser) {
      throw new NotFoundException("User not found");
    }

    await this.taskModel.deleteMany({ userId: deletedUser._id });
    await this.categoryModel.deleteMany({ userId: deletedUser._id });
    if (avatarPublicId) this.imageService.deleteAvatar(avatarPublicId);

    return { success: true };
  }

  async changePassword(
    id: string,
    passwords: ChangePasswordDto
  ): Promise<{ success: boolean }> {
    const { oldPassword, newPassword } = passwords;
    if (oldPassword === newPassword)
      throw new BadRequestException("Passwords cannot be the same");

    const foundUser = await this.userModel.findById(id);
    if (!foundUser) throw new NotFoundException("User not found");

    const isOldPasswordValid = await this.comparePasswords(
      foundUser.password,
      oldPassword
    );
    if (!isOldPasswordValid)
      throw new BadRequestException("Old password is invalid");

    foundUser.password = await this.hashPassword(newPassword);
    foundUser.save();

    return { success: true };
  }

  async comparePasswords(
    hashedValidPass: string,
    comparingPass: string
  ): Promise<boolean> {
    const [salt, storedHash] = hashedValidPass.split(".");
    const hash = ((await scrypt(comparingPass, salt, 32)) as Buffer).toString(
      "hex"
    );

    return hash === storedHash ? true : false;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString("hex");
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = salt + "." + hash.toString("hex");

    return hashedPassword;
  }

  find(
    query: QueryUserDto,
    projection: ProjectionType<User> | null = null
  ): Promise<User[]> {
    return this.userModel.find(query, projection).lean();
  }
}
