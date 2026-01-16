import _waitUntil from "async-wait-until";

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

export const waitUntil = (...args: Parameters<typeof _waitUntil>) => {
  const [predicate, options, timeBetween] = args;

  const optionsObject =
    typeof options === "number" ? { timeout: options } : options ? options : {};

  return _waitUntil(
    predicate,
    {
      timeout: 60000,
      ...optionsObject,
    },
    timeBetween
  );
};

export default { some, waitUntil };
