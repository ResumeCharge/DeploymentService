import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class DeploymentsService {
  constructor(
    @InjectModel(Deployment.name)
    private deploymentModel: Model<DeploymentDocument>,
    @InjectModel(PendingDeployment.name)
    private pendingDeploymentModel: Model<PendingDeploymentDocument>,
    private resumesService: ResumesService,
    private templatesService: TemplatesService,
    private readonly logger: Logger,
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
    user: User,
  ): Promise<Deployment> {
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
    const deployments = await this.deploymentModel
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
    return deployments;
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
    const deployment = await this.deploymentModel.findOne({ _id: id }).exec();
    const pendingDeployment = await this.pendingDeploymentModel
      .findOne({ _id: id })
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
}
