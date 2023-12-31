export interface FontInfo {
  family: string;
  subFamily: string;
  uniqueSubFamily: string;
  size: number;
  path: FontPath;
}

export interface FontPath {
  woff2: string;
}
