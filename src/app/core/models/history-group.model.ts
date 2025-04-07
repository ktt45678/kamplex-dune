import type { HistoryGroupable } from './history-groupable.model';

export interface HistoryGroup {
  groupByDate: string;
  historyList: HistoryGroupable[];
}
