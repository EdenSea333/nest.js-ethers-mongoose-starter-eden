import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document, Types } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema()
export class Setting {
  @Prop({ required: true, default: 0 })
  totalPools: number;

  @Prop({ required: true, default: 0 })
  lastBlockHeight: number;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
