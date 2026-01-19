import type { ModifyHeadersAction } from "../../types";
import type { WebRequestRuleAction } from "./rule";

export class WebRequestModifyHeadersAction implements WebRequestRuleAction<Browser.webRequest.OnHeadersReceivedDetails> {
  public readonly type: "modifyHeaders" = "modifyHeaders";

  private readonly remove: Set<string> = new Set();
  private readonly add: Record<string, string> = {};

  constructor({ responseHeaders }: ModifyHeadersAction) {
    responseHeaders.forEach((h) => {
      const header = h.header.toLowerCase();

      switch (h.operation) {
        case "append":
          throw new Error("Modifyheaders append operation not supported.");
        case "remove":
          this.remove.add(header);
          break;
        case "set":
          this.add[header] = h.value!;
          break;
      }
    });
  }

  public apply(
    e: Browser.webRequest.OnHeadersReceivedDetails
  ): Browser.webRequest.BlockingResponse {
    if (!e.responseHeaders) return {};

    const responseHeaders = e.responseHeaders.filter((h) => {
      const name = h.name.toLowerCase();
      return !this.remove.has(name) || name in this.add;
    });

    for (const name in this.add) {
      const value = this.add[name];
      responseHeaders.push({ name, value });
    }

    return { responseHeaders };
  }
}
