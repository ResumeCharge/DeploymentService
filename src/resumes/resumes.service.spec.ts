import { Test, TestingModule } from '@nestjs/testing';
import { ResumesService } from './resumes.service';
import { getModelToken } from '@nestjs/mongoose';
import { connect, Connection, Model } from 'mongoose';
import { Resume, ResumeSchema } from './schemas/resume.schema';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { createResumeDtoArray } from './resumes.test.helpers';
import { UsersService } from '../users/users.service';
import {
  clearDb,
  seedDb,
  startServer,
  stopServer,
} from '../../test/utils/dbManager';

describe('ResumesService', () => {
  let mongoConnection: Connection;
  let service: ResumesService;
  let model: Model<Resume>;
  const usersService = {
    getUser: jest.fn(),
  };

  beforeAll(async () => {
    const uri = await startServer();
    mongoConnection = (await connect(uri)).connection;
    model = mongoConnection.model(Resume.name, ResumeSchema);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesService,
        {
          provide: getModelToken(Resume.name),
          useValue: model,
        },
      ],
      imports: [ConfigModule, HttpModule],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return usersService;
        }
      })
      .compile();

    service = module.get<ResumesService>(ResumesService);
  });

  beforeEach(async () => {
    await seedDb();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await clearDb();
  });

  afterAll(async () => {
    await stopServer();
  });

  it('should return true if a resume exists', async () => {
    const resume = await model.findOne({ userId: '123' }).exec();
    const result = await service.doesResumeExist(resume.id);
    expect(result).toEqual(true);
  });

  it('should return false if a resume does not exist', async () => {
    const result = await service.doesResumeExist('649e12b7197a46d4c80cbc69');
    expect(result).toEqual(false);
  });

  it('should insert a new resume', async () => {
    const totalResumesPrevious = await model.find({ userId: '123' }).exec();
    await service.create(createResumeDtoArray[0]);
    const totalResumesNew = await model.find({ userId: '123' }).exec();
    expect(totalResumesPrevious.length + 1).toEqual(totalResumesNew.length);
  });
});
