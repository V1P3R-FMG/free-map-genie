import PortAdapter from "../adapters/port";
import DedupeAdapter from "../core/adapters/dedupe";
import { setGlobalAdapter } from "../core/adapter";

const adapter = new DedupeAdapter(new PortAdapter());

self.window?.addEventListener("unload", () => {
  adapter.disconnect();
});

setGlobalAdapter(adapter);

export default adapter;
