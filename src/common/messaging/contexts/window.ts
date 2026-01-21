import WindowAdapter from "../adapters/window";
import DedupeAdapter from "../core/adapters/dedupe";
import { setGlobalAdapter } from "../core/adapter";

const adapter = new DedupeAdapter(new WindowAdapter());

self.window?.addEventListener("unload", () => {
  adapter.disconnect();
});

setGlobalAdapter(adapter);

export default adapter;
