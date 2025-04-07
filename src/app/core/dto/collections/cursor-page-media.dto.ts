import { CursorPaginateDto } from '../common';

export interface CursorPageMediaDto extends Omit<CursorPaginateDto, 'search'> { }
