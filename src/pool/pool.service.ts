import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PikachuContract } from 'src/helpers/contract.constants';
import { CONVALENTQ_KEY, ethersProvider } from 'src/helpers/provider.constants';
import fetch from 'node-fetch';
import { BigNumberish, ethers } from 'ethers';
import { toFloat, toInteger } from 'src/helpers/string.helpers';
import { Setting, SettingDocument } from './schema/setting.schema';
import { Pool, PoolDocument } from './schema/pool.schema';
import { Loan, LoanDocument } from './schema/loan.schema';

@Injectable()
export class PoolService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,

    @InjectModel(Pool.name)
    private readonly poolModel: Model<PoolDocument>,

    @InjectModel(Loan.name)
    private readonly loanModel: Model<LoanDocument>,
  ) {}

  async findAll(): Promise<any> {
    return await this.fetchPools();
  }

  async findLoansByPoolId(poolId: number): Promise<Loan[]> {
    return await this.loanModel.find({ poolId }).lean().exec();
  }

  async getPikachuEvents(
    address: string,
    event: string | string[],
    startingBlock: number,
    endingBlock: number,
  ): Promise<
    {
      block_height: number;
      block_signed_at: string;
      raw_log_data: string;
      raw_log_topics: string[];
      sender_address: string;
      tx_hash: string;
    }[]
  > {
    try {
      let result = await fetch(
        `https://api.covalenthq.com/v1/80001/events/topics/${event}/?quote-currency=USD&format=JSON&starting-block=${startingBlock}&ending-block=${endingBlock}&sender-address=${address}&page-number=&key=${CONVALENTQ_KEY}`,
      );

      result = await result.json();
      if (result.error === true) return [];
      return result.data.items;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async fetchPools() {
    const pageSize = 10 ** 6;
    const [setting, lastBlockNumber] = await Promise.all([
      this.settingModel.findOne(),
      ethersProvider.getBlockNumber(),
    ]);
    let startingBlock, endingBlock;
    do {
      startingBlock = setting.lastBlockHeight;
      endingBlock = Math.min(startingBlock + pageSize, lastBlockNumber);

      const [createdEvents, loanEvents] = await Promise.all([
        this.getPikachuEvents(
          PikachuContract.address,
          PikachuContract.filters.CreatedPool().topics[0],
          startingBlock,
          endingBlock,
        ),
        this.getPikachuEvents(
          PikachuContract.address,
          PikachuContract.filters.CreatedLoan().topics[0],
          startingBlock,
          endingBlock,
        ),
      ]);

      for (let i = 0; i < createdEvents.length; i++) {
        const event = createdEvents[i];
        const owner = `0x${event.raw_log_topics[1].slice(-40)}`;
        const poolId = toInteger(event.raw_log_topics[2]);
        const depositAmount = toFloat(
          ethers.utils.formatEther(event.raw_log_data),
        );
        const blockHeight = event.block_height;

        await this.poolModel.findOneAndUpdate(
          { poolId },
          {
            owner,
            blockHeight,
            depositAmount,
            createdAt: new Date(event.block_signed_at),
          },
          { upsert: true },
        );
      }

      for (let i = 0; i < loanEvents.length; i++) {
        const event = loanEvents[i];
        const poolId = toInteger(event[1]);
        const amount = toFloat(ethers.utils.formatEther(event.raw_log_data));
        const borrower = `0x${event.raw_log_topics[2].slice(-40)}`;
        await this.updateLoan(poolId, borrower);
      }
      setting.lastBlockHeight = endingBlock + 1;
      await setting.save();
    } while (endingBlock < lastBlockNumber);
  }

  async updateLoan(poolId: number, borrower: string) {
    const loan = await PikachuContract.loans(poolId, borrower);
    const loneObj = await this.loanModel.findOneAndUpdate(
      { poolId, borrower },
      {
        poolId,
        borrower: loan.borrower.toLowerCase(),
        collectionContract: loan.collection.toLowerCase(),
        timestamp: loan.timestamp.toNumber() * 1000,
        amount: toFloat(ethers.utils.formatEther(loan.amount)),
        duration: loan.duration.toNumber(),
        tokenId: loan.tokenId.toNumber(),
        status: loan.status,
        blockNumber: loan.blockNumber.toNumber(),
        interestType: loan.interestType,
        interestStartRate: loan.interestStartRate.toNumber() / 100,
        interestCapRate: loan.interestCapRate.toNumber() / 100,
      },
      { upsert: true, new: true },
    );
    return loneObj;
  }
}
