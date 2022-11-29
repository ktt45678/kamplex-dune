export interface ExtStreamSubtitle {
  url: string;
  lang: string;
}

export interface ExtStreamSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface ExtStreamHeaders {
  Referer: string;
}
