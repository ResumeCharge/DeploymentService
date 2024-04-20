import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PaymentIntentDocument = PaymentIntent & Document;

@Schema({ _id: false })
export class PaymentIntent {
  @Prop()
  created: number;
  @Prop()
  status: string;
  @Prop()
  id: string;
  @Prop()
  amount: number;
}

export const PaymentIntentSchema = SchemaFactory.createForClass(PaymentIntent);
