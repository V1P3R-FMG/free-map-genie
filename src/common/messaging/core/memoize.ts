import pMemoize from "p-memoize";

import type { Options as MemoizeOptions } from "p-memoize";

const MemoizeSymbol = Symbol("memoize");

type PossibleMemoizeFunction<T> = T & {
  [MemoizeSymbol]?: MemoizeOptions<any, any>;
};

type GetMemeoizeOptionsResult<T> = T extends (...args: any[]) => any
  ? MemoizeOptions<T, any> | undefined
  : never;

export function Memoize<F extends (...args: any) => any, CacheKeyType = any>(
  options?: MemoizeOptions<F, CacheKeyType>
) {
  return function (f: PossibleMemoizeFunction<F>) {
    f[MemoizeSymbol] = options ?? {};
  };
}

export function getMemoizeOptions<T>(f: PossibleMemoizeFunction<T>) {
  return f[MemoizeSymbol] as GetMemeoizeOptionsResult<T>;
}

export function applyMemoize<T extends (...args: any[]) => any>(
  f: T,
  options?: MemoizeOptions<T, any>
): T {
  if (options) {
    return pMemoize(f, options) as T;
  }
  return f;
}
