const AT_RULE_BLOCKS = /(\s*@(property|font-face)[\s\S]*?{[\s\S]*?})/gm;
const URL_REGEX = /url\((["'])\//g;

export type Css =
  | {
      url: string | string[];
    }
  | {
      textContent: string;
    }
  | undefined;

export class CssHelper {
  private static async mergeCssUrls(urls: string[]): Promise<string> {
    const cssContents = await Promise.all(
      urls.map((url) =>
        fetch(url).then(async (res) => {
          const text = await res.text();
          const url = new URL(res.url);
          return text.replaceAll(URL_REGEX, `url($1${url.origin}/`);
        })
      )
    );

    return cssContents.join("\n");
  }

  private static splitShadowRootCss(css: string): {
    documentCss: string;
    shadowCss: string;
  } {
    const documentCss = Array.from(css.matchAll(AT_RULE_BLOCKS), (m) => m[0])
      .join("")
      .trim();

    const shadowCss = css.replace(AT_RULE_BLOCKS, "").trim();

    return {
      documentCss: documentCss,
      shadowCss: shadowCss,
    };
  }

  private static async fetchCss(css: Css): Promise<string> {
    if (!css) return "";
    if ("textContent" in css) {
      return css.textContent;
    }
    if (Array.isArray(css.url)) {
      return this.mergeCssUrls(css.url);
    }
    const res = await fetch(css.url);
    return res.text();
  }

  public static async processCss(
    css: Css,
    split?: boolean
  ): Promise<{
    documentCss: string;
    shadowCss: string;
  }> {
    const cssText = await this.fetchCss(css);
    if (!cssText) return { documentCss: "", shadowCss: "" };
    if (split) {
      return this.splitShadowRootCss(cssText);
    }
    return { documentCss: cssText, shadowCss: "" };
  }
}
