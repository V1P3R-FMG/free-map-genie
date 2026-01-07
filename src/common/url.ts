export const normalizeUrl = (url: string) => {
  return new URL(url).toString();
};
