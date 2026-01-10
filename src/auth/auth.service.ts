import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { execSync } from 'child_process';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) throw new BadRequestException('이미 존재하는 아이디입니다.');

    let hash: string;
    try {
      hash = execSync(`openssl passwd -6 "${dto.password}"`).toString().trim();
    } catch (err) {
      console.error('Password hashing failed:', err);
      throw new BadRequestException('서버 오류: 비밀번호 처리 실패');
    }

    const user = this.userRepo.create({
      username: dto.username,
      password: hash,
    });
    await this.userRepo.save(user);

    await this.mailService.createMaildir(dto.username);
  }
}
