import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

export type ExtraLinkDocument = ExtraLink & Document;

@Schema({ _id: false })
export class ExtraLink {
  @Prop()
  linkName: string;
  @Prop()
  linkValue: string;
}

export const ExtraLinkSchema =
  SchemaFactory.createForClass(ExtraLink);
