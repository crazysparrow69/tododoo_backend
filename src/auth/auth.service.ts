import { Injectable } from "@nestjs/common";
import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { SignupUserDto } from "./dtos";
import { Session } from "./session.schema";
import { QueryUserDto } from "../user/dtos";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async signup(createUserDto: SignupUserDto) {
    const createdUser = await this.userService.create(createUserDto);

    const token = await this.jwtService.signAsync({
      sub: createdUser._id,
    });

    await this.sessionModel.create({ userId: createdUser._id, token });

    return { token };
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

    const foundToken = await this.sessionModel.findOne({
      userId: foundUser._id,
      isValid: true,
    });
    if (foundToken) {
      foundToken.isValid = false;
      await foundToken.save();
    }

    const token = await this.jwtService.signAsync({
      sub: foundUser._id,
    });

    await this.sessionModel.create({ userId: foundUser._id, token });

    return { token };
  }
}
