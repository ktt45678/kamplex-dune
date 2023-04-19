export function timeStringToSeconds(value: string | null) {
  if (value == null) return value;
  if (!value) return 0;
  const splitValue = value.split(':');
  const seconds = Number(splitValue.pop()) || 0;
  const minutes = Number(splitValue.pop()) || 0;
  const hours = Number(splitValue.pop()) || 0;
  return (hours * 3600) + (minutes * 60) + seconds;
}

export function secondsToTimeString(value: number | null) {
  if (value == null) return value;
  if (!value) return '00:00:00';
  return new Date(value * 1000).toISOString().slice(11, 19);
}
