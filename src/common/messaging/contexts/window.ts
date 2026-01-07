import WindowAdapter from "../adapters/window";
import DedupeAdapter from "../core/adapters/dedupe";

globalThis.__ADAPTER__ = new DedupeAdapter(new WindowAdapter());

export default globalThis.__ADAPTER__;
