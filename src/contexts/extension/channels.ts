import Channel from "@shared/channel";
import { Channels } from "@constants";
import Lazy from "@shared/lazy";

export const extChannel = new Lazy(() => Channel.extension(Channels.Extension));
export const winChannel = new Lazy(() => Channel.window(Channels.Extension));
