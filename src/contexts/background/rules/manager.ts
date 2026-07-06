import type { Rule } from "./types";

export interface RulesManager {
  addRule(rule: Rule): void;
  removeRule(id: number): void;

  enable(ids: number[]): void | Promise<void>;
  disable(ids: number[]): void | Promise<void>;
}
