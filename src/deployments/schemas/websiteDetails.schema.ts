import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type WebsiteDetailsDocument = WebsiteDetails & Document;

@Schema({ _id: false })
export class WebsiteDetails {
  @Prop()
  title: string;
  @Prop()
  description: string;
  @Prop()
  templateName: string;
  @Prop()
  resumeName: string;
  @Prop()
  resumeS3URI: string;
  @Prop()
  profilePictureS3URI: string;
  @Prop()
  websiteIdentifier: string;
  @Prop()
  extraConfigurationOptions: Map<string, string>;
}

export const WebsiteDetailsSchema =
  SchemaFactory.createForClass(WebsiteDetails);
