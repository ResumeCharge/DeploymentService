import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Logger,
  LoggerService,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { UpdateDeploymentDto } from './dto/update-deployment.dto';
import {
  Authorization,
  AuthUser,
} from '../auth/decorators/authorization.decorator';
import { Deployment } from './schemas/deployment.schema';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller('deployments')
export class DeploymentsController {
  constructor(
    private readonly deploymentsService: DeploymentsService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

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
    return await this.deploymentsService.create(deploymentDto, authUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deploymentsService.findOne(id);
  }

  @Get('/user/:userId')
  @Header('Cache-Control', 'private, max-age=5')
  async findAllOrdersForUserId(@Param('userId') userId: string) {
    return await this.deploymentsService.findAllForUserId(userId);
  }

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(
      `Received delete deployment request for deploymentId: ${id}`,
    );
    return this.deploymentsService.remove(id);
  }

  @Delete(':id/cancel')
  cancel(@Param('id') id: string) {
    this.logger.log(
      `Received cancel deployment request for deploymentId: ${id}`,
    );
    return this.deploymentsService.cancelDeployment(id);
  }
}
