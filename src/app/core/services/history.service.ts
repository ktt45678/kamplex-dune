import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CursorPageHistoryDto, FindWatchTimeDto, UpdateHistoryDto, UpdateWatchTimeDto } from '../dto/history';
import { History, HistoryGroupable, HistoryWatchTime, CursorPaginated } from '../models';

@Injectable()
export class HistoryService {
  localStorageKey = 'LocalHistoryStore';

  constructor(private http: HttpClient) { }

  findPage(cursorPageHistoryDto?: CursorPageHistoryDto) {
    const params: { [key: string]: any } = {};
    if (cursorPageHistoryDto) {
      const { pageToken, limit, startDate, endDate, mediaIds, mediaType, mediaOriginalLanguage, mediaYear, mediaAdult, mediaGenres } = cursorPageHistoryDto;
      pageToken && (params['pageToken'] = pageToken);
      limit && (params['limit'] = limit);
      startDate && (params['startDate'] = startDate);
      endDate && (params['endDate'] = endDate);
      mediaIds && (params['mediaIds'] = mediaIds);
      mediaType && (params['mediaType'] = mediaType);
      mediaOriginalLanguage && (params['mediaOriginalLanguage'] = mediaOriginalLanguage);
      mediaYear && (params['mediaYear'] = mediaYear);
      mediaAdult && (params['mediaAdult'] = mediaAdult);
      mediaGenres && (params['mediaGenres'] = mediaGenres);
    }
    return this.http.get<CursorPaginated<HistoryGroupable>>('history', { params });
  }

  update(id: string, updateHistoryDto: UpdateHistoryDto) {
    return this.http.patch<History>(`history/${id}`, updateHistoryDto);
  }

  findWatchTime(findWatchTimeDto: FindWatchTimeDto) {
    const params: { [key: string]: any } = { media: findWatchTimeDto.media };
    findWatchTimeDto.episode && (params['episode'] = findWatchTimeDto.episode);
    return this.http.get<HistoryWatchTime>('history/watch_time', { params });
  }

  updateWatchTime(updateWatchTimeDto: UpdateWatchTimeDto) {
    return this.http.patch<History>('history/watch_time', updateWatchTimeDto);
  }

  remove(id: string) {
    return this.http.delete(`history/${id}`);
  }

  updateLocal(updateHistoryDto: UpdateWatchTimeDto) {
    const historyList = this.getLocalHistory();
    const media = historyList.find(h => {
      return updateHistoryDto.episode ?
        h.media === updateHistoryDto.media && h.episode === updateHistoryDto.episode :
        h.media === updateHistoryDto.media
    });
    if (media) {
      if (media.time === updateHistoryDto.time) return;
      media.time = updateHistoryDto.time;
    } else {
      historyList.push(updateHistoryDto);
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(historyList));
  }

  updateToServer() {
    const historyList = this.getLocalHistory();
    for (let i = 0; i < historyList.length; i++) {
      this.updateWatchTime(historyList[i]).subscribe();
      historyList.splice(i, 1);
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(historyList));
  }

  private getLocalHistory() {
    const historyJson = localStorage.getItem(this.localStorageKey);
    let historyList: UpdateWatchTimeDto[] = [];
    if (historyJson) {
      try {
        historyList = JSON.parse(historyJson);
      } catch { }
    }
    return historyList;
  }
}
