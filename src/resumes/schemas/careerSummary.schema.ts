import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

export type CareerSummaryDocument = CareerSummary & Document;

@Schema({ _id: false })
export class CareerSummary {
  @Prop()
  summary: string;
}

export const CareerSummarySchema =
  SchemaFactory.createForClass(CareerSummary);
