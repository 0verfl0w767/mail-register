import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { MailService } from '../mail/mail.service';
import * as fs from 'fs';

const execFileAsync = promisify(execFile);

@Injectable()
export class AuthService {
  private opensslPath: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {
    this.opensslPath = this.getOpenSSLPath();
  }

  private getOpenSSLPath(): string {
    if (process.platform === 'win32') {
      const gitPath = 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe';

      if (fs.existsSync(gitPath)) {
        return gitPath;
      }
    }
    return 'openssl';
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) throw new BadRequestException('이미 존재하는 아이디입니다.');

    let hash: string;
    try {
      const { stdout } = await execFileAsync(this.opensslPath, [
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

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    if (!user.admin) {
      throw new UnauthorizedException('관리자 권한이 없습니다.');
    }

    // crypt 형식 비밀번호 검증
    const isPasswordValid = await this.verifyCryptPassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    const payload = { username: user.username, admin: user.admin };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async verifyCryptPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      // 해시에서 salt/rounds를 추출해 동일 파라미터로 재계산해야 검증 가능
      const parts = hash.split('$');
      // [$, '6', ('rounds=...' | salt), salt?, hash]
      if (parts.length < 4 || parts[1] !== '6') return false;

      let salt = '';
      let rounds: string | undefined;
      if (parts[2].startsWith('rounds=')) {
        rounds = parts[2].split('=')[1];
        salt = parts[3];
      } else {
        salt = parts[2];
      }
      if (!salt) return false;

      const args = ['passwd', '-6', '-salt', salt];
      if (rounds) {
        args.push('-rounds', rounds);
      }
      args.push(password);

      const { stdout } = await execFileAsync(this.opensslPath, args);
      return stdout.trim() === hash;
    } catch {
      return false;
    }
  }

  async getAllUsers() {
    return await this.userRepo.find({
      order: {
        username: 'ASC',
      },
    });
  }

  async deleteUser(username: string) {
    const user = await this.userRepo.findOne({
      where: { username },
    });
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다.');

    await this.userRepo.delete({ username });
    await this.mailService.deleteMaildir(username);
    return { message: `${username} 사용자가 삭제되었습니다.` };
  }

  async toggleUserActive(username: string) {
    const user = await this.userRepo.findOne({
      where: { username },
    });
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다.');

    user.active = !user.active;
    await this.userRepo.save(user);
    return { username, active: user.active };
  }
}
