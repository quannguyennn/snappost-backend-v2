export const MUX_STREAM_URL = 'rtmps://global-live.mux.com:443/app/';
export const MUX_VIEW_URL = 'https://stream.mux.com/';
export const MUX_VIEW_EXTENSION = '.m3u8';
export const MUX_GIF_URL = (id: number | string, setting: string) =>
  `https://image.mux.com/${id}/animated.gif?${setting ?? 'width=640&fps=30'}`;
