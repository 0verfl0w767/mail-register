import { Body, Controller, Get, Post, Res } from '@nestjs/common';
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
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    await this.authService.register(dto);
    res.send(`
      <script>
        alert("회원가입 성공!");
        location.href="/";
      </script>
    `);
  }
}
