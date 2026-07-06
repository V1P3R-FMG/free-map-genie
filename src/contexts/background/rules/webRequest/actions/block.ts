import type { BlockAction } from "../../types";
import type { WebRequestRuleAction } from "./rule";

export class WebRequestBlockAction implements WebRequestRuleAction<Browser.webRequest.OnBeforeRequestDetails> {
  public readonly type: "block" = "block";

  constructor(_: BlockAction) {}

  public apply(
    _: Browser.webRequest.OnBeforeRequestDetails
  ): Browser.webRequest.BlockingResponse {
    return { cancel: true };
  }
}
