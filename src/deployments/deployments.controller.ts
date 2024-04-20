import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { UpdateDeploymentDto } from './dto/update-deployment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderGuardService } from '../resource-guards/order-guard/order-guard.service';
import {
  Authorization,
  AuthUser,
} from '../auth/decorators/authorization.decorator';
import { S3Service } from '../s3-service/s3.service';
import { GeneratorServiceGuard } from '../resource-guards/generator-service-guard/generator-service-guard';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.interfaces';
import { Deployment } from './schemas/deployment.schema';
import {
  DEPLOYMENT_ERROR_CONCURRENT_DEPLOYMENT,
  DEPLOYMENT_ERROR_DEPLOYMENT_ID_USER_ID_DO_NOT_MATCH,
  DEPLOYMENT_ERROR_NOT_GITHUB_USERNAME,
  DEPLOYMENT_ERROR_USER_INACTIVE,
  DEPLOYMENT_ERROR_WEBSITE_IDENTIFIER_MISSING,
} from '../app.constants';

@Controller('deployments')
export class DeploymentsController {
  constructor(
    private readonly deploymentsService: DeploymentsService,
    private s3Service: S3Service,
    private userService: UsersService,
    private readonly logger: Logger,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Authorization() authUser: AuthUser,
    @Body() deploymentDto: CreateDeploymentDto,
  ): Promise<Deployment> {
    this.logger.log(
      `Received create deployment request: userId: ${deploymentDto.userId},
       resumeId: ${deploymentDto.resumeId},
       templateId: ${deploymentDto.templateId},
       deploymentProvider: ${deploymentDto.deploymentProvider}`,
    );
    const user = await this.userService.getUser(authUser);
    await this.isValidRequest(deploymentDto, user);
    await this.processDeploymentDto(deploymentDto);
    return await this.deploymentsService.create(deploymentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(OrderGuardService)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deploymentsService.findOne(id);
  }

  @Get('/user/:userId')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=5')
  async findAllOrdersForUserId(@Param('userId') userId: string) {
    return await this.deploymentsService.findAllForUserId(userId);
  }

  @UseGuards(GeneratorServiceGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeploymentDto: UpdateDeploymentDto,
  ) {
    this.logger.log(
      `Received update deployment request ${JSON.stringify(
        updateDeploymentDto,
      )}`,
    );
    return await this.deploymentsService.updateDeploymentStatus(
      id,
      updateDeploymentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(OrderGuardService)
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(
      `Received delete deployment request for deploymentId: ${id}`,
    );
    return this.deploymentsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(OrderGuardService)
  @Delete(':id/cancel')
  cancel(@Param('id') id: string) {
    this.logger.log(
      `Received cancel deployment request for deploymentId: ${id}`,
    );
    return this.deploymentsService.cancelDeployment(id);
  }

  private isValidRequest = async (
    createDeploymentDTO: CreateDeploymentDto,
    user: User,
  ) => {
    if (createDeploymentDTO.userId !== user.userId) {
      throw new BadRequestException(
        DEPLOYMENT_ERROR_DEPLOYMENT_ID_USER_ID_DO_NOT_MATCH,
      );
    }
    if (!DeploymentsController.isUserActive(user)) {
      throw new BadRequestException(DEPLOYMENT_ERROR_USER_INACTIVE);
    }
    if (createDeploymentDTO.deploymentProvider === 'AWS') {
      const hasValidWebsiteIdentifier = Boolean(user.websiteIdentifier);
      if (!hasValidWebsiteIdentifier) {
        this.logger.error(
          'User does not have websiteIdentifier set, unable to proceed with deployment',
        );
        throw new BadRequestException(
          DEPLOYMENT_ERROR_WEBSITE_IDENTIFIER_MISSING,
        );
      }
    }
    if (await this.deploymentsService.userHasActiveDeployment(user.userId)) {
      throw new BadRequestException(DEPLOYMENT_ERROR_CONCURRENT_DEPLOYMENT);
    }
    if (
      createDeploymentDTO.deploymentProvider.toLowerCase() === 'github' &&
      !user.githubUserName
    ) {
      throw new BadRequestException(DEPLOYMENT_ERROR_NOT_GITHUB_USERNAME);
    }
  };

  private static isUserActive(userDatabaseRecord): boolean {
    return userDatabaseRecord.isActive;
  }

  private async processDeploymentDto(deploymentDto: CreateDeploymentDto) {
    if (deploymentDto.websiteDetails.profilePicture) {
      try {
        deploymentDto.websiteDetails.profilePictureS3URI =
          await this.s3Service.uploadImageToBucket(
            deploymentDto.websiteDetails.profilePicture,
            deploymentDto.userId,
          );
        deploymentDto.websiteDetails.profilePicture = null;
      } catch (err) {
        this.logger.error('Error trying to upload profile picture to S3', err);
        throw new InternalServerErrorException('Unable to upload image');
      }
    }
    if (deploymentDto.websiteDetails.resumeDocument) {
      try {
        deploymentDto.websiteDetails.resumeS3URI =
          await this.s3Service.uploadPDFToBucket(
            deploymentDto.websiteDetails.resumeDocument,
            deploymentDto.userId,
          );
        deploymentDto.websiteDetails.resumeDocument = null;
      } catch (err) {
        this.logger.error('Error trying to upload resume to S3', err);
        throw new InternalServerErrorException('Unable to upload resume');
      }
    }
  }
}
