import { HistoryGroupable } from '.';

export interface HistoryGroup {
  groupByDate: string;
  historyList: HistoryGroupable[];
}
