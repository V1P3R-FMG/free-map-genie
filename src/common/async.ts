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

export default { some };
