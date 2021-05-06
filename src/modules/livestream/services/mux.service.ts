import { Injectable } from '@nestjs/common';
import Mux from '@mux/mux-node';
import { ApolloError } from 'apollo-server-errors';

const { Video } = new Mux(process.env.MUX_ACCESS_TOKEN, process.env.MUX_SECRET_KEY);

@Injectable()
export class MuxService {
  createStream = async () => {
    try {
      return await Video.LiveStreams.create({
        playback_policy: 'public',
        reduced_latency: true,
        new_asset_settings: { playback_policy: 'public' },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  };

  disable = async (id: string) => {
    try {
      await Video.LiveStreams.disable(id);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  };
}
