import { Duration } from 'date-fns';

export function formatDurationZero(
  duration: Duration,
  options: {
    format: string[]
    zero?: boolean
    delimiter?: string
    locale: Locale
  }
): string {
  const locale = options.locale;
  const format = options.format;
  const zero = options?.zero ?? false;
  const delimiter = options?.delimiter ?? ' ';

  if (!locale.formatDistance) {
    return '';
  }

  let nonZeroFound = false;

  const result = format
    .reduce((acc, unit) => {
      const token = `x${unit.replace(/(^.)/, (m) =>
        m.toUpperCase()
      )}`;
      const value = (<any>duration)[unit];
      if (value !== undefined && ((zero || nonZeroFound) || (<any>duration)[unit])) {
        return acc.concat(locale.formatDistance!(token, value));
      } else {
        nonZeroFound = true;
      }
      return acc;
    }, [] as string[])
    .join(delimiter)

  return result;
}
