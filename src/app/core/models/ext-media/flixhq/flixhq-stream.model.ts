import { ExtStreamHeaders, ExtStreamSource, ExtStreamSubtitle } from '../ext-stream.model';

export interface FlixHQStream {
  headers: ExtStreamHeaders;
  sources: ExtStreamSource[];
  subtitles: ExtStreamSubtitle[];
}
