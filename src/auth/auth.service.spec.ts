import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockMailService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockMailService = {
      createMaildir: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'testuser123',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...registerDto, password: 'hashed' });
      mockUserRepository.save.mockResolvedValue({ ...registerDto, password: 'hashed' });
      mockMailService.createMaildir.mockResolvedValue(undefined);

      await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: registerDto.username },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockMailService.createMaildir).toHaveBeenCalledWith(registerDto.username);
    });

    it('should throw BadRequestException if username already exists', async () => {
      const existingUser = { username: 'testuser123', password: 'hashed' };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockMailService.createMaildir).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if password hashing fails', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const invalidDto = { username: 'test', password: '$(malicious)' };
      await expect(service.register(invalidDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
