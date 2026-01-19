import { RulesManager } from "../manager";
import { WebRequestRule } from "./rule";

import type { Rule } from "../types";

export class WebRequestManager implements RulesManager {
  private readonly rules = new Map<number, WebRequestRule>();

  constructor() {
    logger.debug("Using webRequest to handle requests");
  }

  public addRule(rule: Rule) {
    this.rules.set(rule.id, new WebRequestRule(rule));
  }

  public removeRule(id: number) {
    this.rules.delete(id);
  }

  public enable(ids: number[]) {
    ids.forEach((id) => this.rules.get(id)?.enable());
  }

  public disable(ids: number[]) {
    ids.forEach((id) => this.rules.get(id)?.disable());
  }
}
