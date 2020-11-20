import { EntityRepository } from 'typeorm';
import { CommonRepository } from 'src/modules/common/common.repository';
import { Otp } from '../entities/opt.entity';

@EntityRepository(Otp)
export class OtpRepository extends CommonRepository<Otp> {}
