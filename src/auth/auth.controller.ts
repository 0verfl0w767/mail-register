import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
    res.sendFile(path.join(__dirname, '../../views/register.html'));
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

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getUsersPage(@Res() res: Response) {
    res.sendFile(path.join(__dirname, '../../views/users.html'));
  }

  @Get('api')
  async getAllUsers() {
    const users = await this.authService.getAllUsers();
    return {
      status: 'success',
      data: users,
    };
  }

  @Delete('api/:username')
  async deleteUser(@Param('username') username: string) {
    const result = await this.authService.deleteUser(username);
    return {
      status: 'success',
      message: result.message,
    };
  }

  @Patch('api/:username')
  async toggleUserActive(@Param('username') username: string) {
    const result = await this.authService.toggleUserActive(username);
    return {
      status: 'success',
      data: result,
    };
  }
}
