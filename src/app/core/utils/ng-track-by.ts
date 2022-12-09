export function track_Id(_: number, item: any): any {
  return item?._id;
}

export function trackId(_: number, item: any): any {
  return item?.id;
}

export function trackTabId(_: number, item: any): any {
  return item?.tabId;
}

export function trackLabel(_: number, item: any): any {
  return item?.label;
}

export function trackCreateUrl(_: number, item: any): any {
  return item?.createUrl;
}

export function trackHistoryGroup(_: number, item: any): any {
  return item ? item.groupByDate + item.historyList.length : undefined;
}
