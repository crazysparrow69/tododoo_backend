import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";

import {
  SignupUserDto,
  SigninUserDto,
  GoogleOAuthDto,
  ResendEmailVerificationDto,
} from "./dtos";
import { AuthService } from "../auth/auth.service";
import { AuthResponse } from "./interfaces";
import { ApiResponseStatus } from "src/common/interfaces";
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() body: SignupUserDto): Promise<ApiResponseStatus> {
    return this.authService.signUp(body);
  }

  @Post("signin")
  @Throttle({ default: { limit: 3, ttl: 1000 * 60 } })
  signIn(@Body() body: SigninUserDto): Promise<AuthResponse> {
    return this.authService.signIn(body.email, body.password);
  }

  @Post("google")
  googleOAuth(@Body() body: GoogleOAuthDto): Promise<AuthResponse> {
    return this.authService.googleLogin(body.code);
  }

  @Post("verify-email/:code")
  verifyEmail(@Param("code") code: string): Promise<ApiResponseStatus> {
    return this.authService.verifyEmail(code);
  }

  @Post("resend-email-verification")
  resendEmailVerification(
    @Body() body: ResendEmailVerificationDto
  ): Promise<void> {
    return this.authService.resendEmailVerification(body.email);
  }
}
