import { ExtStreamSource, ExtStreamSubtitle } from '../ext-stream.model';

export interface ZoroStream {
  sources: ExtStreamSource[];
  subtitles: ExtStreamSubtitle[];
}
