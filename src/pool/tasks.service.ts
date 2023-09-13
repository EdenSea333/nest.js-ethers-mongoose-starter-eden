import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PoolService } from './pool.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private readonly poolService: PoolService) {}

  @Cron('40 * * * * *')
  handleCron() {
    this.poolService.fetchPools();
  }
}
