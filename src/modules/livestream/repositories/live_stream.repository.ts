import { CommonRepository } from "src/modules/common/common.repository";
import { LiveStream } from "src/modules/livestream/entities/live_stream.entity";
import { EntityRepository } from "typeorm";

@EntityRepository(LiveStream)
export class LiveStreamRepository extends CommonRepository<LiveStream>{}