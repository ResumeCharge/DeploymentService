import { Test, TestingModule } from '@nestjs/testing';
import { ResumeGuardService } from './resume-guard.service';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, Logger, NotFoundException } from '@nestjs/common';
import * as authHelper from '../../auth/auth.helpers';
import { ResumesService } from '../../resumes/resumes.service';
import { Resume } from '../../resumes/schemas/resume.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from '../../users/users.service';

describe('ResumeGuardService', () => {
  let service: ResumeGuardService;
  let resumesService: ResumesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeGuardService,
        ResumesService,
        UsersService,
        Logger,
        {
          provide: getModelToken(Resume.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<ResumeGuardService>(ResumeGuardService);
    resumesService = module.get<ResumesService>(ResumesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true if all conditions are met', async () => {
    setupBasicSpys();
    const mockExecutionContext = getMockExecutionContext('POST');
    const canActivate = await service.canActivate(mockExecutionContext);
    expect(canActivate).toBeTruthy();
  });

  it('should return true if all conditions are met GET', async () => {
    setupBasicSpys();
    const mockResume: any = { userId: '1234' };
    jest.spyOn(resumesService, 'findOneResume').mockReturnValue(mockResume);
    const mockExecutionContext = getMockExecutionContext('GET');
    const canActivate = await service.canActivate(mockExecutionContext);
    expect(canActivate).toBeTruthy();
  });

  it('should return true if all conditions are met DELETE', async () => {
    setupBasicSpys();
    const mockResume: any = { userId: '1234' };
    jest.spyOn(resumesService, 'findOneResume').mockReturnValue(mockResume);
    const mockExecutionContext = getMockExecutionContext('DELETE');
    const canActivate = await service.canActivate(mockExecutionContext);
    expect(canActivate).toBeTruthy();
  });

  it('should return true if all conditions are met PATCH', async () => {
    setupBasicSpys();
    const mockResume: any = { userId: '1234' };
    jest.spyOn(resumesService, 'findOneResume').mockReturnValue(mockResume);
    const mockExecutionContext = getMockExecutionContext('PATCH');
    const canActivate = await service.canActivate(mockExecutionContext);
    expect(canActivate).toBeTruthy();
  });

  it('should return false if resume is null', async () => {
    setupBasicSpys();
    jest.spyOn(resumesService, 'findOneResume').mockReturnValue(null);
    const mockExecutionContext = getMockExecutionContext('GET');
    try {
      await service.canActivate(mockExecutionContext);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  });

  it('should return false if method is invalid', async () => {
    setupBasicSpys();
    jest.spyOn(resumesService, 'findOneResume').mockReturnValue(null);
    const mockExecutionContext = getMockExecutionContext('SOMETHING');
    try {
      await service.canActivate(mockExecutionContext);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  });

  it('should return false resume has no userId', async () => {
    setupBasicSpys();
    const mockResume: any = {};
    jest.spyOn(resumesService, 'findOneResume').mockReturnValue(mockResume);
    const mockExecutionContext = getMockExecutionContext('GET');
    const canActivate = await service.canActivate(mockExecutionContext);
    expect(canActivate).not.toBeTruthy();
  });

  it("should return false if userId from resume and request don't match", async () => {
    setupBasicSpys();
    const mockResume: any = { userId: '12345' };
    jest.spyOn(resumesService, 'findOneResume').mockReturnValue(mockResume);
    const mockExecutionContext = getMockExecutionContext('GET');
    const canActivate = await service.canActivate(mockExecutionContext);
    expect(canActivate).not.toBeTruthy();
  });

  const setupBasicSpys = () => {
    jest.spyOn(authHelper, 'isValidIdToken').mockReturnValue(
      new Promise((resolve) => {
        resolve(true);
      }),
    );
    jest.spyOn(authHelper, 'isValidRequest').mockReturnValue(true);
    jest
      .spyOn(authHelper, 'getTokenFromExecutionContext')
      .mockReturnValue('1234');
    jest.spyOn(authHelper, 'getUserIdFromAuthToken').mockReturnValue(
      new Promise((resolve) => {
        resolve('1234');
      }),
    );
  };

  const getMockExecutionContext = (method: string) => {
    return createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            token: 'Bearer 1234',
          },
          method: method,
          body: { userId: '1234' },
          params: { id: '1234' },
        }),
      }),
    });
  };

  it('should return false if isValidRequest is false', async () => {
    jest.spyOn(authHelper, 'isValidRequest').mockReturnValue(false);
    const mockExecutionContext = createMock<ExecutionContext>();
    const canActivate = await service.canActivate(mockExecutionContext);
    expect(canActivate).not.toBeTruthy();
  });
});
