import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMaildir', () => {
    const testUsername = 'testuser123';
    const domain = 'syu.kr';
    const expectedPath = `/var/mail/vhosts/${domain}/${testUsername}`;

    it('should successfully create maildir', async () => {
      const mockExecAsync = jest.fn().mockResolvedValue({
        stdout: '',
        stderr: '',
      });
      service['execAsync'] = mockExecAsync;

      await service.createMaildir(testUsername);

      expect(mockExecAsync).toHaveBeenCalled();
      const command = mockExecAsync.mock.calls[0][0];
      expect(command).toContain('mkdir -p');
      expect(command).toContain(expectedPath);
    });

    it('should throw InternalServerErrorException if maildir creation fails', async () => {
      const mockExecAsync = jest
        .fn()
        .mockRejectedValue(new Error('mkdir: permission denied'));
      service['execAsync'] = mockExecAsync;

      await expect(service.createMaildir(testUsername)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should execute command with correct permissions', async () => {
      const mockExecAsync = jest.fn().mockResolvedValue({
        stdout: '',
        stderr: '',
      });
      service['execAsync'] = mockExecAsync;

      await service.createMaildir(testUsername);

      const command = mockExecAsync.mock.calls[0][0];
      expect(command).toContain('chown -R vmail:vmail');
      expect(command).toContain('chmod -R 700');
    });

    it('should handle different usernames', async () => {
      const mockExecAsync = jest.fn().mockResolvedValue({
        stdout: '',
        stderr: '',
      });
      service['execAsync'] = mockExecAsync;

      const username = 'anotheruser456';
      await service.createMaildir(username);

      const command = mockExecAsync.mock.calls[0][0];
      expect(command).toContain(username);
    });
  });
});
