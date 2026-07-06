export type ModifyHeaderInfo = Browser.declarativeNetRequest.ModifyHeaderInfo;

export type ResourceType = `${Browser.declarativeNetRequest.ResourceType}`;

export type RuleCondition = {
  requestDomains?: string[];
  urlFilter?: string;
  regexFilter?: string;
  resourceTypes?: ResourceType[];
};

export type ModifyHeadersAction = {
  type: "modifyHeaders";
  responseHeaders: ModifyHeaderInfo[];
};

export type BlockAction = {
  type: "block";
};

export type RuleAction = ModifyHeadersAction | BlockAction;

export type Rule = {
  id: number;
  action: RuleAction;
  condition: RuleCondition;
};
