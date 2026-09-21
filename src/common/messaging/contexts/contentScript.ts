import ContentScriptAdapter from "../adapters/contentScript";
import DedupeAdapter from "../core/adapters/dedupe";
import { setGlobalAdapter } from "../core/adapter";

const adapter = new DedupeAdapter(new ContentScriptAdapter());

setGlobalAdapter(adapter);

export default adapter;
