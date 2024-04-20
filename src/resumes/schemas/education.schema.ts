import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

export type EducationDocument = Education & Document;

@Schema({ _id: false })
export class Education {
  @Prop()
  degree: string;
  @Prop()
  university: string;
  @Prop()
  startDate: string;
  @Prop()
  endDate: string;
  @Prop()
  details: string;
}

export const EducationSchema =
  SchemaFactory.createForClass(Education);
