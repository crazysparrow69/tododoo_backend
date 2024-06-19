import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { SignupUserDto, SigninUserDto } from "./dtos";
import { AuthService } from "../auth/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() body: SignupUserDto) {
    return this.authService.signup(body);
  }

  @Post("signin")
  signIn(@Body() body: SigninUserDto) {
    return this.authService.signin(body.email, body.password);
  }
}
