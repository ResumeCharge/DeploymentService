import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
export type ProjectDocument = Project & Document;

@Schema({ _id: false })
export class Project {
  @Prop()
  title: string;
  @Prop()
  details: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
