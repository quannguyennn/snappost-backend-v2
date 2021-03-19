import { Injectable } from '@nestjs/common';
import { ReportRepository } from 'src/modules/post/repositories/report.repository';

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
}