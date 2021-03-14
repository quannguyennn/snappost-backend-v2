import { registerEnumType } from '@nestjs/graphql';

export enum FollowStatus {
    WAITING = 'Waiting',
    ACCEPT = 'Accept',
}


registerEnumType(FollowStatus, {
    name: 'FollowStatus',
});
