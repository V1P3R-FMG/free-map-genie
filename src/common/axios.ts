import waitUntil from "async-wait-until";

import type { Axios } from "axios";
import type { Options } from "async-wait-until";

export { default as axios } from "axios";

export type { Axios } from "axios";

export const waitForAxios = async (
  options?: number | Options
): Promise<Axios> => {
  await waitUntil(() => window.axios !== undefined, options);
  return window.axios!;
};
