import { enUS } from 'date-fns/locale';

const formatRelativeLocale = {
  lastWeek: "'Last' eeee",
  yesterday: "'Yesterday",
  today: "'Today",
  tomorrow: "'Tomorrow",
  nextWeek: "eeee",
  other: 'PP',
};

export const enUSDateRelative = {
  ...enUS,
  formatRelative: (token: 'lastWeek' | 'yesterday' | 'today' | 'tomorrow' | 'nextWeek' | 'other') => formatRelativeLocale[token]
};
