import ExtensionAdapter from "../adapters/contentscript";
import DedupeAdapter from "../core/adapters/dedupe";
import { setGlobalAdapter } from "../core/adapter";

const adapter = new DedupeAdapter(new ExtensionAdapter());

self.window?.addEventListener("unload", () => {
  adapter.disconnect();
});

setGlobalAdapter(adapter);

export default adapter;
