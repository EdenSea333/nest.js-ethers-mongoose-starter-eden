import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PoolModule } from './pool/pool.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `${process.env.MONGODB_URI}/${process.env.PIKACHU_NETWORK}?authSource=admin`,
      {
        connectionName: process.env.PIKACHU_NETWORK,
      },
    ),

    PoolModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
