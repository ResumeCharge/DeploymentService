import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type WebsiteTemplateDocument = WebsiteTemplate & Document;

@Schema({ _id: false })
export class WebsiteTemplate {
  @Prop({ type: String })
  _id: string;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  mainImage: string;
  @Prop()
  subImages: Array<string>;
}

export const WebsiteTemplateSchema =
  SchemaFactory.createForClass(WebsiteTemplate);
