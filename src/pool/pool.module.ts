import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { Loan, LoanSchema } from './schema/loan.schema';
import { Pool, PoolSchema } from './schema/pool.schema';
import { Setting, SettingSchema } from './schema/setting.schema';
import { TasksService } from './tasks.service';
console.log(process.env.PIKACHU_NETWORK);
@Module({
  providers: [TasksService, PoolService],
  controllers: [PoolController],
  imports: [
    MongooseModule.forFeature(
      [
        { name: Pool.name, schema: PoolSchema },
        { name: Loan.name, schema: LoanSchema },
        { name: Setting.name, schema: SettingSchema },
      ],
      process.env.PIKACHU_NETWORK,
    ),
  ],
})
export class PoolModule {}
