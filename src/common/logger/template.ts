export type CssStyleEntryName =
  | "common"
  | "timestamp"
  | "entryname"
  | "message"
  | "info"
  | "warn"
  | "error"
  | "debug";

export interface CssStyleEntryValue {
  color?: string;
  background?: string;
  fontWeight?: string;
  margin?: string;
  padding?: string;
  borderRadius?: string;
}

export type CssStyleMap = Record<CssStyleEntryName, CssStyleEntryValue>;

export interface ConsoleLogTemplateTag {
  value: string | (() => string);
  style: string;
}

export interface ConsoleLogTemplateOptions {
  common?: CssStyleEntryValue;
  timestamp?: CssStyleEntryValue;
}

/**
 * Template class to create a formated message.
 * To pass down to a console method.
 */
export class ConsoleLogTemplate {
  private readonly tags: ConsoleLogTemplateTag[] = [];
  private readonly commonCss: CssStyleEntryValue;
  private readonly messageStyle: string;

  public constructor(
    common?: CssStyleEntryValue,
    message?: CssStyleEntryValue
  ) {
    this.commonCss = common ?? {};
    this.messageStyle = this.compileCss(message ?? {});
  }

  /**
   * Adds a tag in fron of the template.
   * @param value the text of the tag.
   * @param css the style of the tag.
   */
  public addTag(value: string | (() => string), css?: CssStyleEntryValue) {
    this.tags.push({
      value,
      style: this.compileCss(css ?? {}),
    });
  }

  /**
   * Creates a string format for the console method.
   * @returns the string format.
   */
  private createTemplateFormatString(): string {
    return this.tags.map((_) => "%c%s").join("") + "%c";
  }

  /**
   * Compiles a css object to a css string.
   * @param css the css to compile.
   * @returns the css object as a string form.
   */
  private compileCss(css: CssStyleEntryValue): string {
    return Object.entries({ ...this.commonCss, ...css })
      .map(([prop, value]) => `${this.transformKebabCase(prop)}:${value};`)
      .join("");
  }

  /**
   * Transforms a prop name to kebab case.
   * @param prop the prop to transform.
   * @returns the transformed prop.
   */
  private transformKebabCase(prop: string): string {
    return prop.replace(/(.)?([A-Z])/g, (_, pre, sub) => {
      return (pre ? pre + "-" : "") + sub.toLowerCase();
    });
  }

  /**
   * Extract all the tags in to a single concurent array of `tag.style` and `tag.value`.
   * @returns the concurent array of `tag.style` and `tag.value`.
   */
  private extractTags(): string[] {
    return this.tags
      .map((tag) => [
        tag.style,
        typeof tag.value === "string" ? tag.value : tag.value(),
      ])
      .flat(1);
  }

  /**
   * Compiles into a array of parameters that need to be passed down to the console method.
   * @returns a array of parameters.
   */
  public compile(): any[] {
    return [
      this.createTemplateFormatString(),
      ...this.extractTags(),
      this.messageStyle,
    ];
  }
}
