export interface WaitForElementOptions {
  subtree?: boolean;
  timeout?: number;
}

export const waitForElement = <T extends HTMLElement>(
  parent: HTMLElement | Document,
  selector: string,
  { subtree = false, timeout = 10000 }: WaitForElementOptions = {}
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const el = parent.querySelector<T>(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = parent.querySelector<T>(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(parent, {
      childList: true,
      subtree,
    });

    if (timeout && timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`waitForElement timeout: ${selector}`));
      }, timeout);
    }
  });
};

export const waitForBody = (doc?: Document, timeout?: number) => {
  return waitForElement<HTMLBodyElement>(
    doc ?? document.documentElement,
    "body",
    {
      timeout: timeout ?? 5000,
    }
  );
};

export const waitForHead = (doc?: Document, timeout?: number) => {
  return waitForElement<HTMLHeadElement>(
    doc ?? document.documentElement,
    "head",
    {
      timeout: timeout ?? 5000,
    }
  );
};

export const waitForDocumentLoaded = () => {
  return new Promise<void>((resolve) => {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      return resolve();
    }
    document.addEventListener("DOMContentLoaded", () => resolve());
  });
};
