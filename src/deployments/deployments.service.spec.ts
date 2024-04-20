import { connect, Connection, Error, Model } from 'mongoose';
import {
  clearCollection,
  startServer,
  stopServer,
} from '../../test/utils/dbManager';
import { Deployment, DeploymentSchema } from './schemas/deployment.schema';
import {
  PendingDeployment,
  PendingDeploymentSchema,
} from './schemas/pendingDeployment.schema';
import {
  WebsiteTemplate,
  WebsiteTemplateSchema,
} from '../templates/schemas/websiteTemplate.schema';
import { Resume, ResumeSchema } from '../resumes/schemas/resume.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentsService } from './deployments.service';
import { Logger } from '@nestjs/common';
import { ResumesService } from '../resumes/resumes.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { TemplatesService } from '../templates/templates.service';
import { S3Service } from '../s3-service/s3.service';
import { UsersService } from '../users/users.service';
import {
  CANCELLATION_REQUESTED,
  CANCELLED,
  FAILED,
  PENDING,
  PENDING_RETRY,
  PROCESSING,
  SENT_TO_GITHUB,
  SUCCESSFUL,
} from './deployment.status.constants';

describe('DeploymentService', () => {
  let deploymentService: DeploymentsService;
  let deploymentModel: Model<Deployment>;
  let pendingDeploymentModel: Model<PendingDeployment>;
  let resumeModel: Model<Resume>;
  let websiteTemplateModel: Model<WebsiteTemplate>;
  let mongoConnection: Connection;
  beforeAll(async () => {
    const uri = await startServer();
    mongoConnection = (await connect(uri)).connection;
    deploymentModel = mongoConnection.model(Deployment.name, DeploymentSchema);
    resumeModel = mongoConnection.model(Resume.name, ResumeSchema);
    websiteTemplateModel = mongoConnection.model(
      WebsiteTemplate.name,
      WebsiteTemplateSchema,
    );
    pendingDeploymentModel = mongoConnection.model(
      PendingDeployment.name,
      PendingDeploymentSchema,
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeploymentsService,
        Logger,
        TemplatesService,
        S3Service,
        ResumesService,
        UsersService,
        ConfigService,
        {
          provide: getModelToken(Deployment.name),
          useValue: deploymentModel,
        },
        {
          provide: getModelToken(PendingDeployment.name),
          useValue: pendingDeploymentModel,
        },
        {
          provide: getModelToken(Resume.name),
          useValue: resumeModel,
        },
        {
          provide: getModelToken(WebsiteTemplate.name),
          useValue: websiteTemplateModel,
        },
      ],
      imports: [HttpModule],
    }).compile();
    deploymentService = await module.resolve<DeploymentsService>(
      DeploymentsService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearCollection('deployments');
  });

  afterAll(async () => {
    await stopServer();
  });

  it('should return true if the user has active deployments', async () => {
    const deployment = await deploymentModel.create(newDeployment);
    let hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(true);
    await deploymentModel.updateOne(
      { _id: deployment._id },
      { status: PENDING },
    );
    hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(true);
    await deploymentModel.updateOne(
      { _id: deployment._id },
      { status: PENDING_RETRY },
    );
    hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(true);
    await deploymentModel.updateOne(
      { _id: deployment._id },
      { status: PROCESSING },
    );
    hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(true);
    await deploymentModel.updateOne(
      { _id: deployment._id },
      { status: SENT_TO_GITHUB },
    );
    hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(true);
    await deploymentModel.updateOne(
      { _id: deployment._id },
      { status: CANCELLATION_REQUESTED },
    );
    hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(true);
  });

  it('should return false if the user has no active deployments', async () => {
    const deployment = await deploymentModel.create(newDeployment);
    await deploymentModel.updateOne(
      { _id: deployment._id },
      { status: SUCCESSFUL },
    );
    let hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(false);
    await deploymentModel.updateOne(
      { _id: deployment._id },
      { status: FAILED },
    );
    hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(false);
    await deploymentModel.updateOne(
      { _id: deployment._id },
      { status: CANCELLED },
    );
    hasActiveDeployments = await deploymentService.userHasActiveDeployment(
      '123',
    );
    expect(hasActiveDeployments).toBe(false);
  });

  it('should implement optimistic concurrency', async () => {
    const deployment = await deploymentModel.create(newDeployment);
    const deployment2 = await deploymentModel.findOne({ _id: deployment._id });
    deployment.status = PROCESSING;
    await deployment.save();
    deployment2.status = SUCCESSFUL;
    await expect(deployment2.save()).rejects.toThrow(Error);
  });

  const newDeployment: CreateDeploymentDto = {
    userId: '123',
    websiteDetails: {
      title: 'My Website 3',
      description: 'My Cool Website 3',
      profilePicture: 'http://link.com',
      resumeDocument: 'http://link2.com',
      resumeS3URI: 'http://link3.com',
      profilePictureS3URI: 'http://link4.com',
    },
    resumeId: null,
    templateId: null,
    seoTag: 'my-tag',
    deploymentProvider: 'GITHUB',
  };
});
