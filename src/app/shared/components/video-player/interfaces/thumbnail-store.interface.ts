import type { ThumbnailState } from 'vidstack';

type ThumbnailStoreProps =
  'activeThumbnail' |
  'loading';

export type ThumbnailStore = Pick<ThumbnailState, ThumbnailStoreProps>;
