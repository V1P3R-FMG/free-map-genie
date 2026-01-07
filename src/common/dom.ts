export const waitForBody = () => {
  return new Promise<HTMLElement>((resolve) => {
    if (document.body) {
      resolve(document.body);
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        resolve(document.body);
      }
    });

    observer.observe(document.documentElement, { childList: true });
  });
};

export const waitForHead = () => {
  return new Promise<HTMLElement>((resolve) => {
    if (document.head) {
      resolve(document.head);
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.head) {
        observer.disconnect();
        resolve(document.head);
      }
    });

    observer.observe(document.documentElement, { childList: true });
  });
};
