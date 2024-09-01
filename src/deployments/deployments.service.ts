import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { UpdateDeploymentDto } from './dto/update-deployment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Deployment, DeploymentDocument } from './schemas/deployment.schema';
import { Model } from 'mongoose';
import { ResumesService } from '../resumes/resumes.service';
import { TemplatesService } from '../templates/templates.service';
import {
  CANCELLATION_REQUESTED,
  PENDING,
  PENDING_RETRY,
  PROCESSING,
  SENT_TO_GITHUB,
} from './deployment.status.constants';
import {
  PendingDeployment,
  PendingDeploymentDocument,
} from './schemas/pendingDeployment.schema';
import { PendingDeploymentDto } from './dto/create-pending-deployment.dto';
import { ObjectId } from 'mongodb';
import { User } from '../users/users.interfaces';
import { AuthUser } from '../auth/decorators/authorization.decorator';
import { UsersService } from '../users/users.service';
import {
  DEPLOYMENT_ERROR_CONCURRENT_DEPLOYMENT,
  DEPLOYMENT_ERROR_NOT_GITHUB_USERNAME,
} from '../app.constants';
import { StaticAssetsService } from '../static-assets/static-assets.service';

enum ITEM_TYPE {
  IMAGE,
  PDF,
}

const RATE_LIMIT_PERIOD_DAYS = 1;
export const MAX_DEPLOYMENTS_IN_RATE_LIMIT = 10;

@Injectable()
export class DeploymentsService {
  constructor(
    @InjectModel(Deployment.name)
    private deploymentModel: Model<DeploymentDocument>,
    @InjectModel(PendingDeployment.name)
    private pendingDeploymentModel: Model<PendingDeploymentDocument>,
    private resumesService: ResumesService,
    private templatesService: TemplatesService,
    private readonly userService: UsersService,
    private readonly logger: Logger,
    private readonly staticAssetsService: StaticAssetsService,
  ) {}

  /*Business logic functions*/

  private async insertPendingDeployment(deploymentId: ObjectId) {
    this.logger.log(
      `Inserting pending deployment for deploymentId: ${deploymentId}`,
    );
    const pendingDeploymentDto = new PendingDeploymentDto();
    pendingDeploymentDto._id = deploymentId;
    const pendingDeployment = new this.pendingDeploymentModel(
      pendingDeploymentDto,
    );
    await pendingDeployment.save();
  }

  /*CRUD FUNCTIONS*/
  remove(_id: string) {
    return this.deploymentModel.findOneAndDelete({ _id: _id }).exec();
  }

  async create(
    createDeploymentDto: CreateDeploymentDto,
    authUser: AuthUser,
  ): Promise<Deployment> {
    const user = await this.userService.getUser(authUser);
    await this.isValidRequest(createDeploymentDto, user);
    await this.saveArtifactsToStaticAssets(createDeploymentDto);
    const createdDeployment = new this.deploymentModel(createDeploymentDto);
    const template = await this.templatesService.findOne(
      createdDeployment.templateId,
    );
    const resume = await this.resumesService.findOneResume(
      createdDeployment.resumeId,
    );
    createdDeployment.websiteDetails.templateName = template._id;
    createdDeployment.websiteDetails.resumeName = resume.nickname;
    createdDeployment.retryCount = 0;
    createdDeployment.lastUpdatedAt = Date.now();
    createdDeployment.websiteDetails.websiteIdentifier = user.websiteIdentifier;
    createdDeployment.githubUserName = user.githubUserName;
    this.logger.log(
      `Created new deployment ${JSON.stringify(
        createdDeployment,
      )}, saving to DB`,
    );
    await createdDeployment.save();
    await this.insertPendingDeployment(createdDeployment._id);
    return createdDeployment;
  }

  findOne(id: string) {
    try {
      return this.deploymentModel.findOne({ _id: id }).exec();
    } catch (e) {
      return null;
    }
  }

  async findAllForUserId(userId: string) {
    return await this.deploymentModel
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }

  async updateDeploymentStatus(
    id: string,
    updateDeploymentDto: UpdateDeploymentDto,
  ) {
    const deployment = await this.deploymentModel.findOne({ _id: id }).exec();
    deployment.status = updateDeploymentDto.status
      ? updateDeploymentDto.status
      : deployment.status;
    deployment.progress = updateDeploymentDto.progress
      ? updateDeploymentDto.progress
      : deployment.progress;
    await deployment.save();
  }

  async userHasActiveDeployment(userId: string): Promise<boolean> {
    const activeDeployments = await this.deploymentModel
      .find({
        status: {
          $in: [
            PENDING,
            PROCESSING,
            PENDING_RETRY,
            SENT_TO_GITHUB,
            CANCELLATION_REQUESTED,
          ],
        },
        userId: userId,
      })
      .exec();
    return activeDeployments.length !== 0;
  }

  async cancelDeployment(id: string) {
    const deployment = await this.deploymentModel.findOne({ id }).exec();
    const pendingDeployment = await this.pendingDeploymentModel
      .findOne({ id })
      .exec();
    /*GeneratorService is responsible for cancelling deployments, it requires a pending deployment entry.
    Backfill the pending deployment if it goes missing for some reason*/
    if (!pendingDeployment) {
      await this.createAndInsertNewPendingDeployment({ _id: deployment._id });
    }
    deployment.cancellationRequested = true;
    return await deployment.save();
  }

  private async createAndInsertNewPendingDeployment(
    pendingDeploymentDTO: PendingDeploymentDto,
  ) {
    return await new this.pendingDeploymentModel(pendingDeploymentDTO).save();
  }

  private isValidRequest = async (
    createDeploymentDTO: CreateDeploymentDto,
    user: User,
  ) => {
    const deploymentProvider =
      createDeploymentDTO.deploymentProvider.toLowerCase();

    if (await this.userHasActiveDeployment(user.userId)) {
      throw new BadRequestException(DEPLOYMENT_ERROR_CONCURRENT_DEPLOYMENT);
    }
    if (deploymentProvider === 'github' && !user.githubUserName) {
      throw new BadRequestException(DEPLOYMENT_ERROR_NOT_GITHUB_USERNAME);
    }
  };

  async userHasExceededDeploymentRateLimit(userId: string) {
    const currentDate = new Date();
    const rateLimitPeriodStart = new Date();
    rateLimitPeriodStart.setDate(
      currentDate.getDate() - RATE_LIMIT_PERIOD_DAYS,
    );
    const deploymentsInRateLimitPeriod = await this.deploymentModel
      .find({
        createdAt: {
          $gt: rateLimitPeriodStart.getTime(),
        },
        userId: userId,
      })
      .exec();
    return deploymentsInRateLimitPeriod.length >= MAX_DEPLOYMENTS_IN_RATE_LIMIT;
  }

  private async saveArtifactsToStaticAssets(
    deploymentDto: CreateDeploymentDto,
  ) {
    const userId = deploymentDto.userId;
    const profilePicture = deploymentDto.websiteDetails.profilePicture;
    const resumeDocument = deploymentDto.websiteDetails.resumeDocument;
    if (deploymentDto.websiteDetails.profilePicture) {
      deploymentDto.websiteDetails.profilePictureFile =
        await this.saveItemToStaticAssets(
          profilePicture,
          userId,
          ITEM_TYPE.IMAGE,
        );
      deploymentDto.websiteDetails.profilePicture = null;
    }
    if (deploymentDto.websiteDetails.resumeDocument) {
      deploymentDto.websiteDetails.resumeFile =
        await this.saveItemToStaticAssets(
          resumeDocument,
          userId,
          ITEM_TYPE.PDF,
        );
      deploymentDto.websiteDetails.resumeDocument = null;
    }
  }

  private saveItemToStaticAssets(
    item: string,
    userId: string,
    itemType: ITEM_TYPE,
  ): string {
    try {
      if (itemType === ITEM_TYPE.IMAGE) {
        return this.staticAssetsService.saveProfilePictureToStaticAssets(
          item,
          userId,
        );
      } else if (itemType === ITEM_TYPE.PDF) {
        return this.staticAssetsService.saveResumeToStaticAssets(item, userId);
      } else {
        throw new InternalServerErrorException(
          'Unable to save static asset, unknown type: ' + itemType,
        );
      }
    } catch (err) {
      this.logger.error('Error trying to save static assets', err);
      throw new InternalServerErrorException('Unable to save static assets');
    }
  }
}
