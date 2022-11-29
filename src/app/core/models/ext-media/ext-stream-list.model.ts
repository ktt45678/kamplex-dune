import { FlixHQStream } from './flixhq';
import { ZoroStream } from './zoro';

export interface ExtStreamList {
  gogoAnimeStreamUrl?: string;
  flixHQStream?: FlixHQStream;
  zoroStream?: ZoroStream;
}
