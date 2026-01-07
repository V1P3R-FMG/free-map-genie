import { Adapter } from "../adapter";

export default class NoopAdapter extends Adapter {
  public onMessage(_: (message: any) => void) {
    console.warn(
      "NoopAdapter: onMessage called, but no operation is performed."
    );
  }

  public sendMessage(_: any) {
    console.warn(
      "NoopAdapter: sendMessage called, but no operation is performed."
    );
  }

  public disconnect() {
    console.warn(
      "NoopAdapter: disconnect called, but no operation is performed."
    );
  }
}
