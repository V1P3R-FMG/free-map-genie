import BackgroundAdapter from "../adapters/background";
import DedupeAdapter from "../core/adapters/dedupe";
import { setGlobalAdapter } from "../core/adapter";

const adapter = new DedupeAdapter(new BackgroundAdapter());

setGlobalAdapter(adapter);

export default adapter;
