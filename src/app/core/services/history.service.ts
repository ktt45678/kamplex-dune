import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CursorPageHistoryDto, UpdateHistoryDto } from '../dto/history';
import { HistoryGroup, CursorPaginated } from '../models';

@Injectable()
export class HistoryService {
  localStorageKey = 'LocalHistoryStore';

  constructor(private http: HttpClient) { }

  findPage(cursorPageHistoryDto?: CursorPageHistoryDto) {
    const params: { [key: string]: any } = {};
    if (cursorPageHistoryDto) {
      const { pageToken, limit } = cursorPageHistoryDto;
      pageToken && (params['pageToken'] = pageToken);
      limit && (params['limit'] = limit);
    }
    return this.http.get<CursorPaginated<HistoryGroup>>('history', { params });
  }

  update(updateHistoryDto: UpdateHistoryDto) {
    return this.http.put<History>('history', updateHistoryDto);
  }

  updateLocal(updateHistoryDto: UpdateHistoryDto) {
    const historyList = this.getLocalHistory();
    const media = historyList.find(h => {
      return updateHistoryDto.episode ?
        h.media === updateHistoryDto.media && h.episode === updateHistoryDto.episode :
        h.media === updateHistoryDto.media
    });
    if (media) {
      if (media.watchTime === updateHistoryDto.watchTime) return;
      media.watchTime = updateHistoryDto.watchTime;
    } else {
      historyList.push(updateHistoryDto);
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(historyList));
  }

  updateToServer() {
    const historyList = this.getLocalHistory();
    for (let i = 0; i < historyList.length; i++) {
      this.update(historyList[i]).subscribe();
      historyList.splice(i, 1);
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(historyList));
  }

  private getLocalHistory() {
    const historyJson = localStorage.getItem(this.localStorageKey);
    let historyList: UpdateHistoryDto[] = [];
    if (historyJson) {
      try {
        historyList = JSON.parse(historyJson);
      } catch { }
    }
    return historyList;
  }

}
