import { forwardRef, Module } from "@nestjs/common";
import { ChatCronService } from "./services/chat.cron";
import { ScheduleModule } from '@nestjs/schedule';
import { ChatModule } from "../chat/chat.module";

@Module({
    imports: [ScheduleModule.forRoot(), forwardRef(() => ChatModule)],
    providers: [ChatCronService],
    exports: [ChatCronService]
})
export class CronModule { }