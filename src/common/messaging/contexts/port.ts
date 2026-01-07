import PortAdapter from "../adapters/port";
import DedupeAdapter from "../core/adapters/dedupe";

globalThis.__ADAPTER__ = new DedupeAdapter(new PortAdapter());

export default globalThis.__ADAPTER__;
