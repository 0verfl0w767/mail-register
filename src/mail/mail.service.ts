import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private execAsync = promisify(exec);

  async createMaildir(username: string): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const devMailPath = path.join(process.cwd(), 'maildir', username);
      try {
        fs.mkdirSync(devMailPath, { recursive: true });
        console.log(`Development maildir created: ${devMailPath}`);
      } catch (error) {
        console.error('Development maildir 생성 실패: ', error);
        throw new InternalServerErrorException('서버 오류: Maildir 생성 실패');
      }
    } else {
      const domain = 'syu.kr';
      const maildirPath = `/var/mail/vhosts/${domain}/${username}`;
      const command = `mkdir -p ${maildirPath} && chown -R vmail:vmail ${maildirPath} && chmod -R 700 ${maildirPath}`;

      try {
        await this.execAsync(command);
        console.log(`Production maildir created: ${maildirPath}`);
      } catch (error) {
        console.error('Maildir 생성 실패: ', error);
        throw new InternalServerErrorException('서버 오류: Maildir 생성 실패');
      }
    }
  }

  async deleteMaildir(username: string): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const devMailPath = path.join(process.cwd(), 'maildir', username);
      try {
        if (fs.existsSync(devMailPath)) {
          fs.rmSync(devMailPath, { recursive: true, force: true });
          console.log(`Development maildir deleted: ${devMailPath}`);
        }
      } catch (error) {
        console.error('Development maildir 삭제 실패: ', error);
        throw new InternalServerErrorException('서버 오류: Maildir 삭제 실패');
      }
    } else {
      const domain = 'syu.kr';
      const maildirPath = `/var/mail/vhosts/${domain}/${username}`;
      const command = `rm -rf ${maildirPath}`;

      try {
        await this.execAsync(command);
        console.log(`Production maildir deleted: ${maildirPath}`);
      } catch (error) {
        console.error('Maildir 삭제 실패: ', error);
        throw new InternalServerErrorException('서버 오류: Maildir 삭제 실패');
      }
    }
  }
}
