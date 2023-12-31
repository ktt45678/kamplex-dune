export interface ThumbnailFrame {
  /** Start time */
  startTime: number;

  /** End time */
  endTime: number;

  /** Sprite path */
  sprite: string;

  /** Left */
  x: number;

  /** Top */
  y: number;

  /** Width */
  width: number;

  /** Height */
  height: number;

  /** Thumbnail hash */
  placeholder: string;
}
