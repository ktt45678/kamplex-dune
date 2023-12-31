import type { ThumbnailState } from 'vidstack';

type ThumbnailStoreProps =
  'activeCue' |
  'loading';

export type ThumbnailStore = Pick<ThumbnailState, ThumbnailStoreProps>;
