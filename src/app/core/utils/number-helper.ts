export function toHexColor(value: number) {
  const hex = value.toString(16);
  return '#' + ('000000' + hex).slice(-6);
}
