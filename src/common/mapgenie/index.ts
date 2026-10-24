import { waitForBody } from "@/common/dom";

export { default as MapgenieAdBlocker } from "./ads";

export * from "./page";
export * from "./links";
export * as mapDataUtils from "./data";

/**
 * This function reloads a blocked mapgenie script.
 * The background script blocks certain mapgenie scripts from loading.
 * We simply append ready to the script URL and re-insert it into the DOM.
 * The background script will allow it to load this time.
 */
export const activateBlockedMapgenieScript = async (name: string) => {
  await waitForBody();

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const scriptPath = new RegExp(`^/js/${escapedName}(?:\\.[a-zA-Z0-9_-]+)?\\.js$`);
  const scripts = [...document.querySelectorAll<HTMLScriptElement>("script[src]")];
  const matches = scripts.filter((script) => {
    const url = new URL(script.src);
    return url.origin === "https://cdn.mapgenie.io" && scriptPath.test(url.pathname);
  });

  // An already activated copy must not be inserted/executed a second time.
  if (matches.some((script) => new URL(script.src).searchParams.has("ready"))) return false;
  const original = matches[0];
  if (!original) return false;

  const url = new URL(original.src);
  // Keep ready first: the blocking rules only match the original URL forms.
  url.search = `?ready${url.search ? `&${url.search.slice(1)}` : ""}`;
  const script = document.createElement("script");
  script.src = url.toString();
  document.body.appendChild(script);
  return true;
};

export const getAuthToken = () => {
  return (
    document.querySelector<HTMLMetaElement>('meta[name="auth-token"]')
      ?.content || null
  );
};

export const setAuthToken = (token: string | null) => {
  let authToken = document.querySelector<HTMLMetaElement>(
    'meta[name="auth-token"]'
  );
  if (!authToken) {
    authToken = document.createElement("meta");
    authToken.name = "auth-token";
    document.head.appendChild(authToken);
  }
  authToken.content = token || "";
};
