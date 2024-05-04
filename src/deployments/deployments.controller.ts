import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
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
import { GeneratorServiceGuard } from '../resource-guards/generator-service-guard/generator-service-guard';
import { Deployment } from './schemas/deployment.schema';

@Controller('deployments')
export class DeploymentsController {
  constructor(
    private readonly deploymentsService: DeploymentsService,
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
    return await this.deploymentsService.create(deploymentDto, authUser);
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
}
