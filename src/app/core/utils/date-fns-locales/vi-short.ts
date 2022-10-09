const formatDistanceLocale: any = { xSeconds: '{{count}}s', xMinutes: '{{count}}m', xHours: '{{count}}h' };
export const viShort = { formatDistance: (token: any, count: any) => formatDistanceLocale[token].replace('{{count}}', count) };
