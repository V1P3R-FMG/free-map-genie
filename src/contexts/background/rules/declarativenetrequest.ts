import type { RulesManager } from "./manager";
import type { Rule } from "./types";

export class DeclarativeNetRequestManager implements RulesManager {
  private readonly rules = new Map<number, Rule>();

  constructor() {
    logger.debug("Using declarativeNetRequest to handle requests");
  }

  public addRule(rule: Rule) {
    this.rules.set(rule.id, rule);
  }

  public removeRule(id: number) {
    this.rules.delete(id);
  }

  public async enable(ids: number[]) {
    const rules = ids
      .map((id) => this.rules.get(id))
      .filter((rule: Rule | undefined): rule is Rule => Boolean(rule));

    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map((rule) => rule.id),
      addRules: rules,
    });
  }

  public async disable(ids: number[]) {
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ids,
    });
  }
}
