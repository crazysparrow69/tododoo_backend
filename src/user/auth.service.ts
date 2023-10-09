import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const createdUser = await this.userService.create(createUserDto);

    const token = await this.jwtService.signAsync({
      sub: createdUser._id,
    });

    return { token };
  }

  async signin(email: string, password: string) {
    const [foundUser] = await this.userService.find({ email } as QueryUserDto);
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.userService.comparePasswords(
      foundUser.password,
      password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const token = await this.jwtService.signAsync({
      sub: foundUser._id,
    });

    return { token };
  }
}
