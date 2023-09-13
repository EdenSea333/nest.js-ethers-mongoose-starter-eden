import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document, Types } from 'mongoose';
import { Pool } from './pool.schema';

export type LoanDocument = Loan & Document;

@Schema({ timestamps: true })
export class Loan {
  @Prop({ required: true })
  poolId: number;

  @Prop({ required: true })
  lender: string;

  @Prop({ required: true })
  borrower: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  collectionContract: string;

  @Prop({ required: true })
  tokenId: number;

  @Prop({ required: true, default: 0 })
  status: number;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true, default: 0 })
  interestType: number;

  @Prop({ required: true, default: 0 })
  interestStartRate: number;

  @Prop({ required: true, default: 0 })
  interestCapRate: number;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
