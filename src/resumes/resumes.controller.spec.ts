import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Resume, ResumeSchema } from './schemas/resume.schema';
import { connect, Connection, Model } from 'mongoose';
import { HttpModule } from '@nestjs/axios';
import {
  clearDb,
  seedDb,
  startServer,
  stopServer,
} from '../../test/utils/dbManager';
import { UsersService } from '../users/users.service';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { expect } from '@jest/globals';
import { Logger, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('ResumesController', () => {
  let resumesController: ResumesController;
  let resumeModel: Model<Resume>;
  let mongoConnection: Connection;
  const usersService = {};

  beforeAll(async () => {
    const uri = await startServer();
    mongoConnection = (await connect(uri)).connection;
    resumeModel = mongoConnection.model(Resume.name, ResumeSchema);
    const moduleRef = await Test.createTestingModule({
      controllers: [ResumesController],
      providers: [
        ResumesService,
        {
          provide: getModelToken(Resume.name),
          useValue: resumeModel,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: { log: jest.fn() },
        },
      ],
      imports: [HttpModule],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return usersService;
        }
      })
      .compile();
    resumesController = moduleRef.get<ResumesController>(ResumesController);
  });

  beforeEach(async () => {
    await seedDb();
  });

  afterEach(async () => {
    await clearDb();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await stopServer();
  });

  it('should return a resume object', async () => {
    const resumes = await resumeModel.find().exec();
    const resume = await resumesController.findOne(resumes[0].id);
    expect(resume).not.toBeNull();
    expect(resume._id).toEqual(resumes[0]._id);
  });

  it('should find all resumes for users', async () => {
    const resumes = await resumeModel.find({ userId: '123' }).exec();
    const resumesFromController = await resumesController.findAllResumesForUser(
      '123',
    );
    expect(resumes.length).toEqual(resumesFromController.length);
  });

  it('should update a resume', async () => {
    const resumes = await resumeModel.find({ userId: '123' }).exec();
    const updateResumeDto: UpdateResumeDto = {
      nickname: 'my-cool-resume',
    };
    const updatedResume = await resumesController.update(
      resumes[0].id,
      updateResumeDto,
    );
    expect(updatedResume.nickname).toEqual('my-cool-resume');
    expect(updatedResume.userId).toEqual(resumes[0].userId);
  });

  it('should not allow the userId to be changed on the resume', async () => {
    const resumes = await resumeModel.find({ userId: '123' }).exec();
    const updateResumeDto: UpdateResumeDto = {
      nickname: 'my-cool-resume',
      userId: 'not-my-id',
    };
    const updatedResume = await resumesController.update(
      resumes[0].id,
      updateResumeDto,
    );
    expect(updatedResume.nickname).toEqual('my-cool-resume');
    expect(updatedResume.userId).toEqual(resumes[0].userId);
  });

  it('should delete a resume', async () => {
    const resumes = await resumeModel.find().exec();
    await resumesController.remove(resumes[0].id);
    await expect(resumesController.findOne(resumes[0].id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw an exception trying to delete a resume that does not exist', async () => {
    const resumes = await resumeModel.find().exec();
    await resumesController.remove(resumes[0].id);
    await expect(resumesController.remove(resumes[0].id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
