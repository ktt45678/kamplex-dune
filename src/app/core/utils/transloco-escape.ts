// https://github.com/lodash/lodash/blob/master/escape.js
const translocoEscapes: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '{': '&#123;',
  '}': '&#125;'
}

const reUnescapedValue = /[&<>"']/g
const reHasUnescapedValue = RegExp(reUnescapedValue.source)

export function translocoEscape(value: string) {
  return (value && reHasUnescapedValue.test(value))
    ? value.replace(reUnescapedValue, (chr) => translocoEscapes[chr])
    : (value || '')
}
