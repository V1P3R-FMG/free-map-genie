import PortAdapter from "../adapters/port";
import DedupeAdapter from "../core/adapters/dedupe";
import { setGlobalAdapter } from "../core/adapter";

const adapter = new DedupeAdapter(new PortAdapter());

setGlobalAdapter(adapter);

export default adapter;
