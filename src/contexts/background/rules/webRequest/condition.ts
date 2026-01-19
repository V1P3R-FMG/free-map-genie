import { LazyGetter } from "lazy-get-decorator";

import type { RuleCondition } from "../types";

export class WebRequestRuleCondition {
  public readonly domains?: string[];
  public readonly regex?: RegExp;
  public readonly types?: Browser.webRequest.ResourceType[] | undefined;

  constructor(condition: RuleCondition) {
    this.domains = condition.requestDomains;
    this.types = condition.resourceTypes as Browser.webRequest.ResourceType[];
    this.regex = this.createRegexFilter(condition);
  }

  private parseUrlFilter(filter: string) {
    const pattern = filter
      .replace(/^[|]/, "^")
      .replace(/[|]$/, "$")
      .replace("||", "(https?|wss?)://")
      .replaceAll(/([.?+])/g, "\\$1")
      .replaceAll("^", "[^\\w_-.%]")
      .replaceAll("*", "[^/]*");
    return new RegExp(pattern);
  }

  private createRegexFilter(condition: RuleCondition) {
    if (condition.regexFilter) {
      return new RegExp(condition.regexFilter);
    }

    if (condition.urlFilter) {
      return this.parseUrlFilter(condition.urlFilter);
    }

    return undefined;
  }

  public matches({ url }: { url: string }) {
    if (this.regex && !this.regex.test(url)) return false;
    return true;
  }

  @LazyGetter()
  public get urls() {
    if (!this.domains) return ["*://*"];

    return Array.from(
      new Set(this.domains).values().map((domain) => `*://${domain}/*`)
    );
  }
}
