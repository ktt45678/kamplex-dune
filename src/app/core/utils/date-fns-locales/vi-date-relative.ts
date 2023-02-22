import { vi } from 'date-fns/locale';

const formatRelativeLocale = {
  lastWeek: "eeee 'tuần trước'",
  yesterday: "'Hôm qua'",
  today: "'Hôm nay'",
  tomorrow: "'Ngày mai'",
  nextWeek: "eeee 'tới'",
  other: 'PP',
}

export const viDateRelative = {
  ...vi,
  formatRelative: (token: 'lastWeek' | 'yesterday' | 'today' | 'tomorrow' | 'nextWeek' | 'other') => formatRelativeLocale[token]
};
