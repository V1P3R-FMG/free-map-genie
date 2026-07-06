import { WebRequestRuleAction } from "./actions/rule";
import { WebRequestBlockAction } from "./actions/block";
import { WebRequestModifyHeadersAction } from "./actions/modifyHeaders";
import { WebRequestRuleCondition } from "./condition";

import type { Rule, RuleAction } from "../types";

export class WebRequestRule {
  public readonly id: number;
  public readonly action: WebRequestRuleAction<any>;
  public readonly condition: WebRequestRuleCondition;

  private readonly _onHandleModifyHeaders = (
    e: Browser.webRequest.OnHeadersReceivedDetails
  ) => this.handleModfiyHeaders(e);

  private readonly _onHandleBlock = (
    e: Browser.webRequest.OnBeforeRequestDetails
  ) => this.handleBlock(e);

  public constructor(rule: Rule) {
    this.id = rule.id;
    this.action = this.createAction(rule.action);
    this.condition = new WebRequestRuleCondition(rule.condition);
  }

  public enable() {
    switch (this.action.type) {
      case "block":
        browser.webRequest.onBeforeRequest.addListener(
          this._onHandleBlock,
          {
            urls: this.condition.urls,
            types: this.condition.types,
          },
          ["blocking"]
        );
        break;
      case "modifyHeaders":
        browser.webRequest.onHeadersReceived.addListener(
          this._onHandleModifyHeaders,
          {
            urls: this.condition.urls,
            types: this.condition.types,
          },
          ["blocking", "responseHeaders"]
        );
        break;
      default:
        // @ts-expect-error
        throw new Error(`Unsupported action.type ${action.type}.`);
    }
  }

  public disable() {
    switch (this.action.type) {
      case "block":
        browser.webRequest.onBeforeRequest.removeListener(this._onHandleBlock);
        break;
      case "modifyHeaders":
        browser.webRequest.onHeadersReceived.removeListener(
          this._onHandleModifyHeaders
        );
        break;
      default:
        // @ts-expect-error
        throw new Error(`Unsupported action.type ${action.type}.`);
    }
  }

  private createAction(action: RuleAction) {
    switch (action.type) {
      case "block":
        return new WebRequestBlockAction(action);
      case "modifyHeaders":
        return new WebRequestModifyHeadersAction(action);
      default:
        // @ts-expect-error
        throw new Error(`Unsupported action.type ${action.type}.`);
    }
  }

  private checkNotSupportedBlockingResponseKeys(
    type: RuleAction["type"],
    response: Browser.webRequest.BlockingResponse,
    keys: (keyof Browser.webRequest.BlockingResponse)[]
  ) {
    for (const key of keys) {
      if (response[key]) {
        throw new Error(`Key ${key} is not supported on action.type ${type}.`);
      }
    }
  }

  private handleModfiyHeaders(
    e: Browser.webRequest.OnHeadersReceivedDetails
  ): Browser.webRequest.BlockingResponse {
    if (!this.condition.matches(e)) return {};

    const response = this.action.apply(e);

    // For sanity throw errors for non supported blocking responses
    this.checkNotSupportedBlockingResponseKeys("modifyHeaders", response, [
      "authCredentials",
      "cancel",
      "requestHeaders",
      "redirectUrl",
    ]);

    return response;
  }

  private handleBlock(
    e: Browser.webRequest.OnBeforeRequestDetails
  ): Browser.webRequest.BlockingResponse {
    if (!this.condition.matches(e)) return {};

    const response = this.action.apply(e);

    // For sanity throw errors for non supported blocking responses
    this.checkNotSupportedBlockingResponseKeys("block", response, [
      "authCredentials",
      "responseHeaders",
      "requestHeaders",
      "redirectUrl",
    ]);

    return response;
  }
}
