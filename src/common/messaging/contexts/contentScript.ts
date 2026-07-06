import ContentScriptAdapter from "../adapters/contentScript";
import DedupeAdapter from "../core/adapters/dedupe";
import { setGlobalAdapter } from "../core/adapter";

const adapter = new DedupeAdapter(new ContentScriptAdapter());

self.window?.addEventListener("unload", () => {
  adapter.disconnect();
});

setGlobalAdapter(adapter);

export default adapter;
