export interface FlixHQWatch {
  headers: FlixHQHeaders;
  sources: FlixHQSource[];
  subtitles?: FlixHQSubtitle[];
}

export interface FlixHQSubtitle {
  url: string;
  lang: string;
}

export interface FlixHQSource {
  url: string;
  quality?: string;
  isM3U8: boolean;
}

export interface FlixHQHeaders {
  Referer: string;
}
