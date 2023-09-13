import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document, Types } from 'mongoose';

export type PoolDocument = Pool & Document;

@Schema()
export class Pool {
  @Prop({ required: true, index: true })
  poolId: number;

  @Prop({ required: true })
  owner: string;

  @Prop({ default: false })
  paused: boolean;

  @Prop({ required: true })
  blockHeight: number;

  @Prop({ required: true, default: 0 })
  depositAmount: number;

  @Prop({ required: true, default: 0 })
  availableAmount: number;

  @Prop({ required: true })
  createdAt: Date;
}

export const PoolSchema = SchemaFactory.createForClass(Pool);
