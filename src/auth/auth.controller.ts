import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { SignupUserDto, SigninUserDto, GoogleOAuthDto } from "./dtos";
import { AuthService } from "../auth/auth.service";
import { AuthResponse } from "./interfaces";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() body: SignupUserDto): Promise<AuthResponse> {
    return this.authService.signup(body);
  }

  @Post("signin")
  signIn(@Body() body: SigninUserDto): Promise<AuthResponse> {
    return this.authService.signin(body.email, body.password);
  }

  @Post("google")
  googleOAuth(@Body() body: GoogleOAuthDto): Promise<AuthResponse> {
    return this.authService.googleLogin(body.code);
  }
}
