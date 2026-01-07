export const toUrl = (url: string) => {
  try {
    return new URL(url, window.location.origin);
  } catch {
    return new URL("https://" + url, window.location.origin);
  }
};

export const normalizeUrl = (url: string) => {
  return toUrl(url).toString();
};
