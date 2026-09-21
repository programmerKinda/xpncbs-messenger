import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('send-code')
  sendCode(@Body('phone') phone: string) {
    return this.authService.sendCode(phone)
  }

  @Post('verify-code')
  verifyCode(
    @Body('phone') phone: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyCode(phone, code)
  }
}