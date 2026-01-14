import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRegisterPage', () => {
    it('should send register.html file', () => {
      const mockResponse = {
        sendFile: jest.fn(),
      };

      controller.getRegisterPage(mockResponse as any);

      expect(mockResponse.sendFile).toHaveBeenCalled();
      const callPath = mockResponse.sendFile.mock.calls[0][0];
      expect(callPath).toContain('register.html');
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'testuser123',
      password: 'password123',
    };

    it('should successfully register a user', async () => {
      mockAuthService.register.mockResolvedValue(undefined);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        status: 'success',
        message: '회원가입이 완료되었습니다.',
      });
    });

    it('should call AuthService.register with correct DTO', async () => {
      mockAuthService.register.mockResolvedValue(undefined);

      await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });
  });
});
