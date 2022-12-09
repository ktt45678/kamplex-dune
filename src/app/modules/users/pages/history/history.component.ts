import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CursorPaginated, HistoryGroup } from '../../../../core/models';
import { DestroyService, HistoryService } from '../../../../core/services';
import { trackHistoryGroup, track_Id } from '../../../../core/utils';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  providers: [HistoryService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit {
  loadingHistoryList: boolean = false;
  historyLimit: number = 30;
  historyGroupList?: CursorPaginated<HistoryGroup>;
  skeletonArray: Array<any>;
  track_Id = track_Id;
  trackHistoryGroup = trackHistoryGroup;

  constructor(private ref: ChangeDetectorRef, private historyService: HistoryService, private destroyService: DestroyService) {
    this.skeletonArray = new Array(this.historyLimit);
  }

  ngOnInit(): void {
    this.loadHistoryList();
  }

  loadHistoryList(pageToken?: string): void {
    this.loadingHistoryList = true;
    this.historyService.findPage({ pageToken, limit: this.historyLimit }).subscribe(newGroupList => {
      this.appendHistoryList(newGroupList);
    }).add(() => {
      this.loadingHistoryList = false;
      this.ref.markForCheck();
    });
  }

  appendHistoryList(newList: CursorPaginated<HistoryGroup>): void {
    if (!this.historyGroupList) {
      this.historyGroupList = newList;
      return;
    }
    if (this.historyGroupList.nextPageToken === newList.nextPageToken
      && this.historyGroupList.prevPageToken === newList.prevPageToken)
      return;
    this.historyGroupList.nextPageToken = newList.nextPageToken;
    this.historyGroupList.prevPageToken = newList.prevPageToken;
    newList.results.forEach(result => {
      const findObj = this.historyGroupList!.results.find(r => r.groupByDate === result.groupByDate);
      if (!findObj)
        this.historyGroupList!.results.push(result)
      else
        findObj.historyList.push(...result.historyList);
    });
  }
}
