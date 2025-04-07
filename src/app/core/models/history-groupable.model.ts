import type { History } from './history.model';

export interface HistoryGroupable extends History {
  groupByDate: string;
}
