import BackgroundAdapter from "../adapters/background";
import DedupeAdapter from "../core/adapters/dedupe";

globalThis.__ADAPTER__ = new DedupeAdapter(new BackgroundAdapter());

export default globalThis.__ADAPTER__;
