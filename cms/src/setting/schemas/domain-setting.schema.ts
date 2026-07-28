import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DomainSettingDocument = DomainSetting & Document;

@Schema({ timestamps: true })
export class DomainSetting {
  @Prop({ required: true, unique: true, index: true })
  domain: string;

  @Prop({ required: true })
  targetUrl: string;
}

export const DomainSettingSchema = SchemaFactory.createForClass(DomainSetting);
