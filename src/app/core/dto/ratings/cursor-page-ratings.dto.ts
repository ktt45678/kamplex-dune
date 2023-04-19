import { CursorPaginateDto } from '../common';

export interface CursorPageRatingsDto extends Omit<CursorPaginateDto, 'search'> {
  user?: string | null;
}
