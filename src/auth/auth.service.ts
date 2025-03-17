import { Injectable } from "@nestjs/common";
import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { JwtService } from "@nestjs/jwt";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";

import { SignupUserDto } from "./dtos";
import { Session } from "./session.schema";
import { QueryUserDto } from "../user/dtos";
import { UserService } from "../user/user.service";
import { transaction } from "src/common/transaction";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
    private userService: UserService,
    private jwtService: JwtService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async signup(createUserDto: SignupUserDto) {
    const newToken = await transaction<string>(
      this.connection,
      async (session) => {
        const createdUser = await this.userService.create(
          createUserDto,
          session
        );

        const token = await this.jwtService.signAsync({
          sub: createdUser._id,
        });

        const newSession = new this.sessionModel({
          userId: createdUser._id,
          token,
        });
        await newSession.save({ session });

        return token;
      }
    );

    return { token: newToken };
  }

  async signin(email: string, password: string) {
    const [foundUser] = await this.userService.find({ email } as QueryUserDto, {
      _id: 1,
      password: 1,
    });
    if (!foundUser) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await this.userService.comparePasswords(
      foundUser.password,
      password
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Invalid password");
    }

    const newToken = await transaction<string>(
      this.connection,
      async (session) => {
        const foundToken = await this.sessionModel.findOne({
          userId: foundUser._id,
          isValid: true,
        });
        if (foundToken) {
          foundToken.isValid = false;
          await foundToken.save({ session });
        }

        const token = await this.jwtService.signAsync({
          sub: foundUser._id,
        });

        const newSession = new this.sessionModel({
          userId: foundUser._id,
          token,
        });
        await newSession.save({ session });

        return token;
      }
    );

    return { token: newToken };
  }
}
