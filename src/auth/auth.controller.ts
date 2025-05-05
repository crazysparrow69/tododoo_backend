import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";

import { SignupUserDto, SigninUserDto, GoogleOAuthDto } from "./dtos";
import { AuthService } from "../auth/auth.service";
import { AuthResponse } from "./interfaces";
import { ApiResponseStatus } from "src/common/interfaces";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() body: SignupUserDto): Promise<ApiResponseStatus> {
    return this.authService.signUp(body);
  }

  @Post("signin")
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
}
