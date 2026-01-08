import { createService, Memoize, type ProxiedObject } from "@/common/messaging";

export class TestService {
  private _memoizedCounter = 0;
  private _counter = 0;

  public hello() {
    return "world";
  }

  public test() {
    return "test success";
  }

  @Memoize()
  public memoizedCounter() {
    return this._memoizedCounter++;
  }

  public counter() {
    return this._counter++;
  }
}

console.log("TestService initialized.", new TestService());

const testService = createService({
  context() {
    return new TestService();
  },
  namespace: "TestService",
  heartbeatTimeout: 60000,
});

export namespace testService {
  export type Instance = ProxiedObject<TestService>;
}

export default testService;
