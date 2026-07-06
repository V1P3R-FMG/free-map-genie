import { MergedRef } from "#imports";

export interface MergedRef<T> {
  (instance: T | null): void;
  current: T | null;
}

const setRefValue = <T>(ref: React.Ref<T> | undefined, value: T | null) => {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    ref.current = value;
  }
};

const createMergedRef = <T>(
  ...refs: Array<React.Ref<T> | undefined>
): MergedRef<T> => {
  return new Proxy((() => {}) as MergedRef<T>, {
    apply(target, __, [value]) {
      target.current = value;
      refs.forEach((ref) => setRefValue(ref, value));
    },
    get(target, prop) {
      if (prop === "current") {
        return target.current;
      }
      return Reflect.get(target, prop);
    },
  }) as unknown as MergedRef<T>;
};

export class ReactUtils {
  public static useMergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
    return React.useMemo(() => createMergedRef(...refs), refs);
  }

  public static setRefValue<T>(ref: React.Ref<T> | undefined, value: T) {
    setRefValue(ref, value);
  }
}
