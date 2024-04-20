import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

export type PendingDeploymentDocument = PendingDeployment & Document;

@Schema()
export class PendingDeployment {
  @Prop({ type: ObjectId })
  _id;
}

export const PendingDeploymentSchema =
  SchemaFactory.createForClass(PendingDeployment);
