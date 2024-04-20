import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AboutMeDocument = AboutMe & Document;

@Schema({ _id: false })
export class AboutMe {
  @Prop()
  aboutMe: string;
}

export const AboutMeSchema = SchemaFactory.createForClass(AboutMe);
