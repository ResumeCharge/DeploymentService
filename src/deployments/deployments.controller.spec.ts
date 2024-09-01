import { Test } from '@nestjs/testing';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TemplatesService } from '../templates/templates.service';
import { connect, Connection, Model } from 'mongoose';
import { Deployment, DeploymentSchema } from './schemas/deployment.schema';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ResumesService } from '../resumes/resumes.service';
import {
  WebsiteTemplate,
  WebsiteTemplateSchema,
} from '../templates/schemas/websiteTemplate.schema';
import { Resume, ResumeSchema } from '../resumes/schemas/resume.schema';
import { AuthUser } from '../auth/decorators/authorization.decorator';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import {
  clearDb,
  RESUME_ID,
  seedDb,
  startServer,
  stopServer,
  TEMPLATE_ID,
} from '../../test/utils/dbManager';
import { UsersService } from '../users/users.service';
import { PENDING, PROCESSING } from './deployment.status.constants';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  PendingDeployment,
  PendingDeploymentSchema,
} from './schemas/pendingDeployment.schema';
import { User } from '../users/users.interfaces';
import { StaticAssetsService } from '../static-assets/static-assets.service';

describe('DeploymentsController', () => {
  let deploymentsController: DeploymentsController;
  let deploymentService: DeploymentsService;
  let httpService: HttpService;
  let staticAssetsService: StaticAssetsService;
  let deploymentModel: Model<Deployment>;
  let websiteTemplateModel: Model<WebsiteTemplate>;
  let resumeModel: Model<Resume>;
  let pendingDeploymentModel: Model<PendingDeployment>;
  let userService: UsersService;
  let mongoConnection: Connection;
  let configService: ConfigService;

  beforeAll(async () => {
    const uri = await startServer();
    mongoConnection = (await connect(uri)).connection;
    deploymentModel = mongoConnection.model(Deployment.name, DeploymentSchema);
    pendingDeploymentModel = mongoConnection.model(
      PendingDeployment.name,
      PendingDeploymentSchema,
    );
    websiteTemplateModel = mongoConnection.model(
      WebsiteTemplate.name,
      WebsiteTemplateSchema,
    );
    resumeModel = mongoConnection.model(Resume.name, ResumeSchema);
    const moduleRef = await Test.createTestingModule({
      controllers: [DeploymentsController],
      providers: [
        DeploymentsService,
        Logger,
        TemplatesService,
        StaticAssetsService,
        ResumesService,
        UsersService,
        ConfigService,
        {
          provide: getModelToken(Deployment.name),
          useValue: deploymentModel,
        },
        {
          provide: getModelToken(WebsiteTemplate.name),
          useValue: websiteTemplateModel,
        },
        {
          provide: getModelToken(Resume.name),
          useValue: resumeModel,
        },
        {
          provide: getModelToken(PendingDeployment.name),
          useValue: pendingDeploymentModel,
        },
      ],
      imports: [HttpModule],
    }).compile();
    deploymentsController = moduleRef.get<DeploymentsController>(
      DeploymentsController,
    );
    userService = moduleRef.get<UsersService>(UsersService);
    staticAssetsService =
      moduleRef.get<StaticAssetsService>(StaticAssetsService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    httpService = moduleRef.get<HttpService>(HttpService);
    deploymentService = moduleRef.get<DeploymentsService>(DeploymentsService);
    newDeployment.resumeId = RESUME_ID;
    newDeployment.templateId = TEMPLATE_ID;
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

  it('should throw an exception when it fails to upload the image', async () => {
    jest
      .spyOn(userService, 'getUser')
      .mockImplementation(async () => databaseUser);
    jest
      .spyOn(staticAssetsService, 'saveResumeToStaticAssets')
      .mockImplementation(() => 'resume.pdf');
    jest
      .spyOn(staticAssetsService, 'saveProfilePictureToStaticAssets')
      .mockImplementation(() => {
        throw new InternalServerErrorException('');
      });
    jest
      .spyOn(deploymentService, 'userHasActiveDeployment')
      .mockImplementation(async () => false);
    await expect(
      deploymentsController.create({ userId: '123' }, newDeployment),
    ).rejects.toThrow(InternalServerErrorException);
    expect(staticAssetsService.saveProfilePictureToStaticAssets).toBeCalled();
  });

  it('should throw an exception when it fails to upload the resume', async () => {
    jest
      .spyOn(userService, 'getUser')
      .mockImplementation(async () => databaseUser);
    jest
      .spyOn(staticAssetsService, 'saveProfilePictureToStaticAssets')
      .mockImplementation(() => 'resume.pdf');
    jest
      .spyOn(staticAssetsService, 'saveResumeToStaticAssets')
      .mockImplementation(() => {
        throw new InternalServerErrorException('BAD!');
      });
    jest
      .spyOn(deploymentService, 'userHasActiveDeployment')
      .mockImplementation(async () => false);
    await expect(
      deploymentsController.create({ userId: '123' }, newDeployment),
    ).rejects.toThrow(InternalServerErrorException);
    expect(staticAssetsService.saveProfilePictureToStaticAssets).toBeCalled();
  });

  it('should find all deployments for a user', async () => {
    const deployments = await deploymentsController.findAllOrdersForUserId(
      authUser.userId,
    );
    expect(deployments.length).toBe(3);
  });

  it("should find no deployments for a user that doesn't exist", async () => {
    const deployments = await deploymentsController.findAllOrdersForUserId(
      'not-a-real-id',
    );
    expect(deployments.length).toBe(0);
  });

  it('should find no deployments for a null userId', async () => {
    const deployments = await deploymentsController.findAllOrdersForUserId(
      null,
    );
    expect(deployments.length).toBe(0);
  });

  it('should find a single deployment', async () => {
    const allDeployments = await deploymentsController.findAllOrdersForUserId(
      authUser.userId,
    );
    const deploymentId = allDeployments[0].id;
    const deployment = await deploymentsController.findOne(deploymentId);
    expect(deployment).not.toBeNull();
  });

  it('should find no deployments for a null deploymentId', async () => {
    const deployment = await deploymentsController.findOne(null);
    expect(deployment).toBeNull();
  });

  it('should throw an exception if the deploymentId is invalid', async () => {
    await expect(
      deploymentsController.findOne('not-a-deployment'),
    ).rejects.toThrowError('Cast to ObjectId failed for value');
  });

  it('should create a new deployment for the user', async () => {
    const resumes = await resumeModel.find().exec();
    const templates = await websiteTemplateModel.find().exec();
    const deployment: CreateDeploymentDto = {
      ...newDeployment,
      resumeId: resumes[0].id,
      templateId: templates[0].id,
    };
    await deploymentModel.deleteMany().exec();
    const data = ['test'];
    const response: AxiosResponse<any> = {
      data,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };
    jest
      .spyOn(userService, 'getUser')
      .mockImplementation(async () => databaseUser);
    jest
      .spyOn(staticAssetsService, 'saveResumeToStaticAssets')
      .mockImplementation(() => 'resume.pdf');
    jest
      .spyOn(staticAssetsService, 'saveProfilePictureToStaticAssets')
      .mockImplementation(() => 'image.jpeg');
    jest
      .spyOn(userService, 'getUserOAuthToken')
      .mockImplementation(async () => 'token');
    jest
      .spyOn(configService, 'get')
      .mockImplementation(() => 'http://endpoint.com');
    jest.spyOn(httpService, 'post').mockImplementation(() => of(response));
    const createdDeployment = await deploymentsController.create(
      authUser,
      deployment,
    );
    expect(createdDeployment).not.toBeNull();
    expect(createdDeployment.status).toBe(PENDING);
    expect(createdDeployment.lastUpdatedAt).not.toBeNull();
    expect(createdDeployment.deploymentProvider).toBe('GITHUB');
  });

  it('should throw an exception if we cant find a user', async () => {
    jest.spyOn(userService, 'getUser').mockRejectedValue(() => {
      throw new Error('BAD!');
    });
    await expect(
      deploymentsController.create({ userId: '123' }, newDeployment),
    ).rejects.toThrow(Error);
  });

  it('should throw an exception if the deployment creation fails', async () => {
    jest
      .spyOn(userService, 'getUser')
      .mockImplementation(async () => databaseUser);
    jest
      .spyOn(staticAssetsService, 'saveResumeToStaticAssets')
      .mockImplementation(() => 'resume.pdf');
    jest
      .spyOn(staticAssetsService, 'saveProfilePictureToStaticAssets')
      .mockImplementation(() => 'image.jpeg');
    jest.spyOn(deploymentService, 'create').mockImplementation(async () => {
      throw new BadRequestException('');
    });
    await expect(
      deploymentsController.create({ userId: '123' }, newDeployment),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return the deployment status', async () => {
    const allDeployments = await deploymentsController.findAllOrdersForUserId(
      authUser.userId,
    );
    const deploymentId = allDeployments[0].id;
    const deployment = await deploymentsController.findOne(deploymentId);
    expect(deployment).not.toBeNull();
    expect(deployment.status).toBe(PENDING);
  });

  describe('deleteDeployment', () => {
    it('should delete the deployment', async () => {
      const allDeployments = await deploymentsController.findAllOrdersForUserId(
        authUser.userId,
      );
      const deploymentId = allDeployments[0].id;
      await deploymentsController.remove(deploymentId);
      const deployment = await deploymentsController.findOne(deploymentId);
      expect(deployment).toBeNull();
    });
  });

  it('should update the deployment status when cancellation is requested', async () => {
    const allDeployments = await deploymentsController.findAllOrdersForUserId(
      authUser.userId,
    );
    const deploymentId = allDeployments[0].id;
    let deployment = await deploymentsController.findOne(deploymentId);
    expect(deployment).not.toBeNull();
    await deploymentsController.cancel(deploymentId);
    deployment = await deploymentsController.findOne(deploymentId);
    expect(deployment.cancellationRequested).toBe(true);
    expect(deployment.status).toBe(PENDING);
  });

  it('should not cancel the deployment if it is not in a cancellable state', async () => {
    const allDeployments = await deploymentsController.findAllOrdersForUserId(
      authUser.userId,
    );
    jest
      .spyOn(userService, 'getUserOAuthToken')
      .mockImplementation(async () => '');
    jest
      .spyOn(userService, 'getUserGithubName')
      .mockImplementation(async () => '');
    const deploymentId = allDeployments[2].id;
    let deployment = await deploymentsController.findOne(deploymentId);
    expect(deployment).not.toBeNull();
    deployment.status = 'PROCESSING';
    await deployment.save();
    await deploymentsController.cancel(deploymentId);
    deployment = await deploymentsController.findOne(deploymentId);
    expect(deployment.status).toBe(PROCESSING);
  });
  it('should throw an exception of the user tries to schedule more than 1 deployment', async () => {
    jest
      .spyOn(userService, 'getUser')
      .mockImplementation(async () => databaseUser);
    await expect(
      deploymentsController.create({ userId: '123' }, newDeployment),
    ).rejects.toThrow(BadRequestException);
  });
});

const authUser: AuthUser = {
  userId: '123',
};

const newDeployment: CreateDeploymentDto = {
  userId: '123',
  websiteDetails: {
    title: 'My Website 3',
    description: 'My Cool Website 3',
    profilePicture: 'http://link.com',
    resumeDocument: 'http://link2.com',
    resumeFile: 'resume.pdf',
    profilePictureFile: 'image.jpeg',
  },
  resumeId: null,
  templateId: null,
  seoTag: 'my-tag',
  deploymentProvider: 'GITHUB',
};

const databaseUser: User = {
  isActive: true,
  isEmailVerified: false,
  email: '123@gmail.com',
  lastUpdatedAt: 1665440553727,
  createdAt: 1665440553726,
  userId: '123',
  websiteIdentifier: 'bestbongoman',
  githubUserName: 'username',
};
