import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class MailService {
  async createMaildir(username: string): Promise<void> {
    const domain = 'syu.kr';
    const maildirPath = `/var/mail/vhosts/${domain}/${username}`;
    const command = `mkdir -p ${maildirPath} && chown -R vmail:vmail ${maildirPath} && chmod -R 700 ${maildirPath}`;

    try {
      await execAsync(command);
    } catch (error) {
      console.error('Maildir 생성 실패: ', error);
      throw new InternalServerErrorException('서버 오류: Maildir 생성 실패');
    }
  }
}
