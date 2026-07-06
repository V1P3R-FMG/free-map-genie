import _waitUntil from "async-wait-until";
import type {
  Predicate,
  PredicateReturnValue,
  Options as WaitUntilOptions,
} from "async-wait-until";

export const some = async (promises: Promise<boolean>[]): Promise<boolean> => {
  return new Promise<boolean>(async (resolve, reject) => {
    try {
      await Promise.any(
        promises.map((promise) =>
          promise
            .then((result) => {
              if (!result) throw new Error();
              resolve(true);
            })
            .catch(reject)
        )
      );
    } catch {
      resolve(false);
    }
  });
};

export const waitUntil = <T extends PredicateReturnValue>(
  predicate: Predicate<T>,
  options: number | WaitUntilOptions = 60000,
  intervalBetweenAttempts: number = 50
) => {
  return _waitUntil(predicate, options, intervalBetweenAttempts);
};

export default { some, waitUntil };
