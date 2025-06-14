import { Injectable } from "@nestjs/common";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { JwtService } from "@nestjs/jwt";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { OAuth2Client } from "google-auth-library";

import { SignupUserDto } from "./dtos";
import { Session } from "./session.schema";
import { QueryUserDto } from "../user/dtos";
import { UserService } from "../user/user.service";
import { transaction } from "src/common/transaction";
import { ConfigService } from "@nestjs/config";
import { AuthResponse } from "./interfaces";

@Injectable()
export class AuthService {
  private oAuth2Client: OAuth2Client;

  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {
    this.oAuth2Client = new OAuth2Client({
      clientId: this.configService.get("GOOGLE_CLIENT_ID"),
      clientSecret: this.configService.get("GOOGLE_CLIENT_SECRET"),
      redirectUri: "postmessage",
    });
  }

  async signup(dto: SignupUserDto): Promise<AuthResponse> {
    const newToken = await transaction<string>(
      this.connection,
      async (session) => {
        const createdUser = await this.userService.create(dto, session);

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

  async signin(email: string, password: string): Promise<AuthResponse> {
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
        await this.sessionModel.updateMany(
          { userId: foundUser._id, isValid: true },
          { isValid: false },
          { session }
        );

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

  async googleLogin(code: string): Promise<AuthResponse> {
    const { tokens } = await this.oAuth2Client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) {
      throw new BadRequestException("No ID token returned by Google");
    }

    const ticket = await this.oAuth2Client.verifyIdToken({
      idToken,
      audience: this.configService.get("GOOGLE_CLIENT_ID"),
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new BadRequestException("Invalid Google token");
    }

    const { email, given_name: name, family_name: lastName } = payload;

    try {
      const newToken = await transaction<string>(
        this.connection,
        async (session) => {
          let user = (await this.userService.find({ email }))[0];
          if (!user) {
            user = await this.userService.createOAuthUser(
              {
                username: name + lastName,
                email,
              },
              session
            );
          }

          const token = await this.jwtService.signAsync({
            sub: user._id,
          });

          const newSession = new this.sessionModel({
            userId: user._id,
            token,
          });
          await newSession.save({ session });

          return token;
        }
      );

      return { token: newToken };
    } catch (err: any) {
      throw new InternalServerErrorException();
    }
  }
}
