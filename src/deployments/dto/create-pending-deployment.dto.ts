import { ObjectId } from 'mongodb';
import { IsNotEmpty, IsString } from 'class-validator';

export class PendingDeploymentDto {
  @IsNotEmpty()
  @IsString()
  _id: ObjectId;
}
