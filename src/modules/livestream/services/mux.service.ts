import { Injectable } from '@nestjs/common';
import Mux from '@mux/mux-node';

const { Video } = new Mux(process.env.MUX_ACCESS_TOKEN, process.env.MUX_SECRET_KEY);

@Injectable()
export class MuxService {
  createStream = async () => {
    try {
      return await Video.LiveStreams.create({
        playback_policy: 'public',
        new_asset_settings: { playback_policy: 'public' },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  };
}
