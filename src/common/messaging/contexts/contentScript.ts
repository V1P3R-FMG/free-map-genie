import ContentScriptAdapter from "../adapters/contentScript";
import DedupeAdapter from "../core/adapters/dedupe";

globalThis.__ADAPTER__ = new DedupeAdapter(new ContentScriptAdapter());

export default globalThis.__ADAPTER__;
