import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
export type WorkExperienceDocument = WorkExperience & Document;

@Schema({ _id: false })
export class WorkExperience {
  @Prop()
  roleName: string;
  @Prop()
  company: string;
  @Prop()
  location: string;
  @Prop()
  startDate: string;
  @Prop()
  endDate: string;
  @Prop()
  details: string;
}

export const WorkExperienceSchema = SchemaFactory.createForClass(WorkExperience);
