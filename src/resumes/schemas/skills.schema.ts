import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type SkillsDocument = Skills & Document;

@Schema({ _id: false })
export class Skills {
  @Prop()
  skills: string;
}

export const SkillsSchema = SchemaFactory.createForClass(Skills);
