import { Injectable } from '@nestjs/common';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { ReportRepository } from 'src/modules/post/repositories/report.repository';
import { ReportPostConnection } from '../entities/report.entity';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepo: ReportRepository) {}

  reportPost = async (userId: number, postId: number) => {
    try {
      const newReport = this.reportRepo.create({ userId, postId });
      await this.reportRepo.save(newReport);
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getPostReported = async (limit: number, page: number): Promise<ReportPostConnection> => {
    const [items, total] = await this.reportRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return createPaginationObject(items, total, page, limit);
  };
}
