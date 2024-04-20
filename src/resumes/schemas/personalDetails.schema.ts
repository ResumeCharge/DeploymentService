import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PersonalDetailsDocument = PersonalDetails & Document;

@Schema({ _id: false })
export class PersonalDetails {
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  profilePictureLink: string;
  @Prop()
  location: string;
  @Prop()
  avatar: string;
  @Prop()
  email: string;
  @Prop()
  phone: string;
  @Prop()
  website: string;
  @Prop()
  linkedin: string;
  @Prop()
  github: string;
  @Prop()
  languages: Array<{ name: string; level: string }>;
}

export const PersonalDetailsSchema =
  SchemaFactory.createForClass(PersonalDetails);
