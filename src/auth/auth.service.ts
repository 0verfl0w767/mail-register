import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { MailService } from '../mail/mail.service';

const execFileAsync = promisify(execFile);

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
      const { stdout } = await execFileAsync('openssl', [
        'passwd',
        '-6',
        dto.password,
      ]);
      hash = stdout.trim();
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
