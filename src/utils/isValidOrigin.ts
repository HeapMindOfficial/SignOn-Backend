export function isValidOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    return value === `${url.protocol}//${url.host}`;
  } catch {
    return false;
  }
}
