import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  WebsiteDetailsDocument,
  WebsiteDetailsSchema,
} from './websiteDetails.schema';
import { PENDING } from '../deployment.status.constants';

export type DeploymentDocument = Deployment & Document;

@Schema({ optimisticConcurrency: true })
export class Deployment {
  @Prop({ default: Date.now, index: true, unique: false, sparse: false })
  createdAt: number;
  @Prop({ default: Date.now })
  lastUpdatedAt: number;
  @Prop({ default: PENDING })
  status: string;
  @Prop()
  progress: number;
  @Prop({ index: true, unique: false, sparse: false })
  userId: string;
  @Prop({ type: WebsiteDetailsSchema })
  websiteDetails: WebsiteDetailsDocument;
  @Prop()
  templateId: string;
  @Prop()
  resumeId: string;
  @Prop()
  deployedUrl: string;
  @Prop()
  isActive: boolean;
  @Prop()
  retryCount: number;
  @Prop()
  deploymentProvider: string;
  @Prop()
  cancellationRequested: boolean;
  @Prop()
  cloudFrontInvalidationId: string;
  @Prop()
  githubUserName: string;
}

export const DeploymentSchema = SchemaFactory.createForClass(Deployment);
