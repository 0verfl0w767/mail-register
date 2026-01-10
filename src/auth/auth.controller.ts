import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import * as path from 'path';

@Controller('register')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getRegisterPage(@Res() res: Response) {
    res.sendFile(path.join(__dirname, '../../public/register.html'));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return {
      status: 'success',
      message: '회원가입이 완료되었습니다.',
    };
  }
}
