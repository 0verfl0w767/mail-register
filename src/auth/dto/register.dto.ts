import { Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @Matches(/^[a-z0-9._-]{8,20}$/, {
    message: '아이디 형식이 올바르지 않습니다.',
  })
  username: string;

  @MinLength(8, {
    message: '비밀번호는 최소 8자 이상이어야 합니다.',
  })
  password: string;
}
