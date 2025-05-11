import { Injectable } from "@nestjs/common";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { JwtService } from "@nestjs/jwt";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { ClientSession, Model } from "mongoose";
import { OAuth2Client } from "google-auth-library";

import { SignupUserDto } from "./dtos";
import { Session } from "./session.schema";
import { UserService } from "../user/user.service";
import { transaction } from "src/common/transaction";
import { ConfigService } from "@nestjs/config";
import { AuthResponse } from "./interfaces";
import { CodeService } from "src/code/code.service";
import { Code, CodeTypes } from "src/code/code.schema";
import { MailService } from "src/mail/mail.service";
import { User } from "src/user/user.schema";
import { CODE_REQUEST_EMAIL_VERIFICATION_LIMIT } from "src/common/constants";

@Injectable()
export class AuthService {
  private oAuth2Client: OAuth2Client;

  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<Session>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Code.name) private readonly codeModel: Model<Code>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly codeService: CodeService,
    private readonly mailService: MailService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {
    this.oAuth2Client = new OAuth2Client({
      clientId: this.configService.get("GOOGLE_CLIENT_ID"),
      clientSecret: this.configService.get("GOOGLE_CLIENT_SECRET"),
      redirectUri: "postmessage",
    });
  }

  async signUp(dto: SignupUserDto): Promise<AuthResponse> {
    const { token, email } = await transaction<{
      token: string;
      email: string;
    }>(this.connection, async (session) => {
      const createdUser = await this.userService.create(dto, session);
      const authToken = await this.issueAuthToken(
        createdUser._id.toString(),
        session
      );
      await this.requestEmailVerification(createdUser, session);

      return { token: authToken, email: createdUser.email };
    });

    return { token, email };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userModel.findOne(
      { email },
      { _id: 1, password: 1 }
    );
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await this.userService.comparePasswords(
      user.password,
      password
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Invalid password");
    }

    const token = await this.issueAuthToken(user._id.toString());

    return { token, isEmailVerified: user.isEmailVerified, email: user.email };
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
      const token = await transaction<string>(
        this.connection,
        async (session) => {
          let user = await this.userModel.findOne({ email });
          if (!user) {
            user = await this.userService.createOAuthUser(
              { username: name + lastName, email },
              session
            );
          }

          const authToken = await this.issueAuthToken(
            user._id.toString(),
            session
          );

          return authToken;
        }
      );

      return { token };
    } catch (err: any) {
      throw new InternalServerErrorException();
    }
  }

  async verifyEmail(code: string): Promise<AuthResponse> {
    const foundCode = await this.codeService.validateCode(code);

    const token = await transaction<string>(
      this.connection,
      async (session) => {
        const user = await this.userModel.findByIdAndUpdate(
          foundCode.userId,
          { isEmailVerified: true },
          { session }
        );
        if (!user) {
          throw new NotFoundException("User not found");
        }

        foundCode.isValid = false;
        await foundCode.save({ session });

        const authToken = await this.issueAuthToken(
          user._id.toString(),
          session
        );

        return authToken;
      }
    );

    return { token };
  }

  async resendEmailVerification(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.isEmailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    const lastCode = await this.codeModel
      .findOne({ userId: user._id, type: CodeTypes.EMAIL_VERIFICATION })
      .sort({ createdAt: -1 });
    if (lastCode) {
      const age = Date.now() - lastCode.createdAt.getTime();
      if (age < CODE_REQUEST_EMAIL_VERIFICATION_LIMIT) {
        throw new BadRequestException(
          "You can request email verification once per 15 min"
        );
      }
    }

    await this.requestEmailVerification(user);
  }

  private async requestEmailVerification(
    user: User,
    session?: ClientSession
  ): Promise<void> {
    const generatedCode = await this.codeService.create(
      user._id.toString(),
      CodeTypes.EMAIL_VERIFICATION,
      session
    );

    const verificationLink = `${this.configService.get("CLIENT_URL")}/auth/verify-email/${generatedCode}`;

    await this.mailService.send({
      from: this.configService.get("EMAIL_FROM"),
      to: user.email,
      subject: "Email Verification",
      text: `Hello ${user.username}. Thanks for signing up for Tododoo! Please confirm your email address by clicking the link below (valid for 15 min): ${verificationLink}. If you did not create a Tododoo account, simply ignore this email and no changes will be made.`,
    });
  }

  private async issueAuthToken(
    userId: string,
    session?: ClientSession
  ): Promise<string> {
    if (session) {
      return this._issueAuthTokenInternal(userId, session);
    }

    return transaction<string>(this.connection, (session) =>
      this._issueAuthTokenInternal(userId, session)
    );
  }

  private async _issueAuthTokenInternal(
    userId: string,
    session: ClientSession
  ): Promise<string> {
    await this.sessionModel.updateMany(
      { userId, isValid: true },
      { isValid: false },
      { session }
    );

    const token = await this.jwtService.signAsync({ sub: userId });

    const newSession = new this.sessionModel({ userId, token });
    await newSession.save({ session });

    return token;
  }
}
