import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, {
  ClientSession,
  Model,
  ProjectionType,
  Types,
} from "mongoose";

import {
  ChangePasswordDto,
  OAuthUserDto,
  QueryUserDto,
  UserBaseDto,
  UserProfileDto,
} from "./dtos";
import { UserMapperService } from "./user-mapper.service";
import { User, UserDocument } from "./user.schema";
import { SignupUserDto } from "../auth/dtos";
import { Category } from "../category/category.schema";
import { ImageService } from "../image/image.service";
import { Task } from "../task/schemas";
import { transaction } from "src/common/transaction";
import { UserAvatar } from "src/image/schemas";
import { ApiResponseStatus, WithPagination } from "src/common/interfaces";
import { getUserPopulate } from "./user.populate";

const scrypt = promisify(_scrypt);

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(UserAvatar.name) private userAvatarModel: Model<UserAvatar>,
    private imageService: ImageService,
    private userMapperService: UserMapperService,
    @InjectConnection() private readonly connection: mongoose.Connection
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
        isEmailVerified: 1,
        avatarId: 1,
        profileEffectId: 1,
        avatarEffectId: 1,
        createdAt: 1,
        roles: 1,
      })
      .populate(getUserPopulate())
      .lean();
    if (!foundUser) throw new NotFoundException("User not found");

    return this.userMapperService.toUserProfile(foundUser);
  }

  async getUserPublicProfile(id: string): Promise<UserBaseDto> {
    const foundUser = await this.userModel
      .findById(new Types.ObjectId(id), {
        _id: 1,
        username: 1,
        avatarId: 1,
        profileEffectId: 1,
        avatarEffectId: 1,
        createdAt: 1,
        isBanned: 1,
      })
      .populate(getUserPopulate())
      .lean();
    if (!foundUser) throw new NotFoundException("User not found");

    return this.userMapperService.toUserBase(foundUser);
  }

  async findUsersByUsername({
    username,
    page = 1,
    limit = 10,
  }: QueryUserDto): Promise<WithPagination<UserBaseDto>> {
    const query = { username: { $regex: username, $options: "i" } };

    const [total, foundUsers] = await Promise.all([
      this.userModel.countDocuments(query),
      this.userModel
        .find(query, { username: 1, avatarId: 1, avatarEffectId: 1 })
        .populate(getUserPopulate())
        .lean()
        .limit(limit)
        .skip((page - 1) * limit)
        .sort("username"),
    ]);

    return {
      results: this.userMapperService.toUsersBase(foundUsers),
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(
    createUserDto: SignupUserDto,
    session?: ClientSession
  ): Promise<User> {
    const foundUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (foundUser) {
      throw new BadRequestException("Email already in use");
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    await newUser.save({ session });

    return newUser;
  }

  async createOAuthUser(
    dto: OAuthUserDto,
    session?: ClientSession
  ): Promise<UserDocument> {
    const foundUser = await this.userModel.findOne({ email: dto.email });
    if (foundUser) {
      throw new BadRequestException("Email already in use");
    }

    const newUser = new this.userModel({ ...dto, isEmailVerified: true });
    await newUser.save({ session });

    return newUser;
  }

  async update(id: string, attrs: Partial<User>): Promise<UserProfileDto> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, attrs, { new: true })
      .populate(getUserPopulate())
      .lean()
      .select([
        "_id",
        "username",
        "email",
        "avatarId",
        "profileEffectId",
        "avatarEffectId",
        "createdAt",
      ]);
    if (!updatedUser) throw new NotFoundException("User not found");

    return this.userMapperService.toUserProfile(updatedUser);
  }

  async remove(id: string): Promise<ApiResponseStatus> {
    await transaction<User>(this.connection, async (session) => {
      const user = await this.userModel
        .findByIdAndDelete(id, { session })
        .lean();
      if (!user) {
        throw new NotFoundException("User not found");
      }

      await this.taskModel.deleteMany({ userId: user._id }, { session });
      await this.categoryModel.deleteMany({ userId: user._id }, { session });

      if (user.avatarId) {
        const foundUserAvatar = await this.userAvatarModel.findById(
          user.avatarId
        );
        if (foundUserAvatar) {
          await foundUserAvatar.deleteOne({ session });

          await this.imageService.deleteAvatarFromCloudinary(
            foundUserAvatar.public_id
          );
        }
      }

      return user;
    });

    return { success: true };
  }

  async changePassword(
    id: string,
    passwords: ChangePasswordDto
  ): Promise<ApiResponseStatus> {
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
    query: Partial<User>,
    projection: ProjectionType<User> | null = null
  ): Promise<User[]> {
    return this.userModel.find(query, projection).lean();
  }
}
