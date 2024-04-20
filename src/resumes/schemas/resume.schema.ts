import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  PersonalDetailsDocument,
  PersonalDetailsSchema,
} from './personalDetails.schema';
import { ExtraLinkDocument, ExtraLinkSchema } from './extraLink.schema';
import {
  CareerSummaryDocument,
  CareerSummarySchema,
} from './careerSummary.schema';
import { EducationDocument, EducationSchema } from './education.schema';
import {
  WorkExperienceDocument,
  WorkExperienceSchema,
} from './workExperience.schema';
import { ProjectDocument, ProjectSchema } from './project.schema';
import { AboutMeDocument, AboutMeSchema } from './aboutMe.schema';
import { Skills, SkillsSchema } from './skills.schema';

export type ResumeDocument = Resume & Document;

@Schema({ _id: true })
export class Resume {
  @Prop({ index: true, unique: false, sparse: false, immutable: true })
  userId: string;
  @Prop()
  nickname: string;
  @Prop({ default: Date.now })
  createdAt: number;
  @Prop({ default: Date.now })
  lastUpdatedAt: number;
  @Prop({ type: PersonalDetailsSchema })
  personalDetails: PersonalDetailsDocument;
  @Prop({ type: [ExtraLinkSchema] })
  extraLinkList: [ExtraLinkDocument];
  @Prop({ type: CareerSummarySchema })
  careerSummary: CareerSummaryDocument;
  @Prop({ type: [EducationSchema] })
  educationList: [EducationDocument];
  @Prop({ type: [WorkExperienceSchema] })
  workExperienceList: [WorkExperienceDocument];
  @Prop({ type: [ProjectSchema] })
  projectsList: [ProjectDocument];
  @Prop({ type: SkillsSchema })
  skills: Skills;
  @Prop()
  awardsAndAccoladesList: Array<string>;
  @Prop({ type: AboutMeSchema })
  aboutMe: AboutMeDocument;
  @Prop()
  resumeDocumentLink: string;
  @Prop()
  extraDetails: Map<string, string>;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
