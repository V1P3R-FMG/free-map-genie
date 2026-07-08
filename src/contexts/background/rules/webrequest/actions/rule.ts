import type { RuleAction } from "../../types";

export interface WebRequestRuleAction<Details> {
  type: RuleAction["type"];

  apply(e: Details): Browser.webRequest.BlockingResponse;
}
