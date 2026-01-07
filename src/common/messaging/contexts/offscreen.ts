import ExtensionAdapter from "../adapters/contentScript";
import DedupeAdapter from "../core/adapters/dedupe";

globalThis.__ADAPTER__ = new DedupeAdapter(new ExtensionAdapter());

export default globalThis.__ADAPTER__;
