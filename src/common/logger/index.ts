import { ConsoleLogTemplate } from "./template";

import type { CssStyleMap } from "./template";

type PickMatching<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

export type ConsoleMethods = PickMatching<
  typeof console,
  (...args: any) => any
>;
export type ConsoleMethodName = keyof ConsoleMethods;

export type LogMethodName = "info" | "warn" | "error" | "debug";

interface RemoteLogger {
  log(prefix: string, ...args: any): Promise<void>;
  warn(prefix: string, ...args: any): Promise<void>;
  error(prefix: string, ...args: any): Promise<void>;
  debug(prefix: string, ...args: any): Promise<void>;
}

/**
 * Logger class with a bit more style to it.
 */
export class Logger {
  public readonly name: string;

  private readonly prefix?: string;

  private service: RemoteLogger | null = null;

  private muted: boolean;

  protected readonly css: CssStyleMap = Object.seal({
    common: {
      borderRadius: "3px",
      padding: "0 5px",
      margin: "2px",
      color: "#fff",
      fontWeight: "bolder",
    },
    timestamp: {
      color: "#b5b5b5",
      background: "none",
      fontWeight: "light",
    },
    entryname: {
      color: "#f5f5f5",
      background: "#c91664",
      fontWeight: "light",
    },
    message: {},
    info: { background: "#0390fc", color: "#eee" },
    warn: { background: "#faaf00", color: "#eee" },
    error: { background: "#ff3333", color: "#eee" },
    debug: { background: "#8b32ba", color: "#eee" },
  });

  protected readonly infoTemplate: ConsoleLogTemplate;
  protected readonly warnTemplate: ConsoleLogTemplate;
  protected readonly errorTemplate: ConsoleLogTemplate;
  protected readonly debugTemplate: ConsoleLogTemplate;

  public constructor(name?: string, prefix?: string) {
    this.name = name ?? "Logger";
    this.muted = false;
    this.prefix = prefix ?? this.getEntryName();

    this.infoTemplate = this.createTemplate("info");
    this.warnTemplate = this.createTemplate("warn");
    this.errorTemplate = this.createTemplate("error");
    this.debugTemplate = this.createTemplate("debug");
  }

  protected createTemplate(logName: LogMethodName): ConsoleLogTemplate {
    const template = new ConsoleLogTemplate(this.css.common, this.css.message);

    template.addTag(Logger.getTimestamp, this.css.timestamp);
    template.addTag(this.name, this.css[logName]);

    if (this.prefix) {
      template.addTag(`${this.prefix}`, this.css.entryname);
    }

    return template;
  }

  /** Gets entry name from env or gets it from the filename */
  protected getEntryName() {
    if (import.meta.env.ENTRYPOINT) {
      return import.meta.env.ENTRYPOINT;
    }

    const href = globalThis.window?.location.href;

    if (!href) return;
    if (!browser?.runtime.getURL) return;

    const rootUrl = browser.runtime.getURL("/");

    if (href.startsWith(rootUrl)) {
      const file = href.replace(rootUrl, "");
      const parts = file.split(".").slice(0, -1);
      return parts.join(".");
    }
  }

  /** Creates a timestamp of the current time. */
  protected static getTimestamp(this: void) {
    return new Date().toTimeString().split(" ")[0];
  }

  /**
   * Creates a callback for the given console method.
   * If muted it will give an empty method.
   * @param name the name of the logger method.
   * @param the name of the console method.
   * @returns the created console callback.
   */
  private createLogCallback<M extends ConsoleMethodName>(
    name: LogMethodName,
    method: M
  ): Console[M] {
    if (this.muted || (name === "debug" && !import.meta.env.DEV))
      return () => () => {};
    return this.bindConsoleCallback(name, method);
  }

  /**
   * Binds a console method with the correct args.
   * @param name the name of the logger method.
   * @param the name of the console method.
   * @returns the created console callback.
   */
  private bindConsoleCallback<M extends ConsoleMethodName>(
    name: LogMethodName,
    method: M
  ): Console[M] {
    return console[method].bind(console, ...this[`${name}Template`].compile());
  }

  /** Logger methods. */
  get raw() {
    return console.log;
  }
  get log() {
    if (this.service) {
      return this.service.log.bind(this.service, this.prefix ?? "");
    }
    return this.createLogCallback("info", "log");
  }
  get warn() {
    if (this.service) {
      return this.service.warn.bind(this.service, this.prefix ?? "");
    }
    return this.createLogCallback("warn", "warn");
  }
  get error() {
    if (this.service) {
      return this.service.error.bind(this.service, this.prefix ?? "");
    }
    return this.createLogCallback("error", "error");
  }
  get debug() {
    if (this.service) {
      return this.service.debug.bind(this.service, this.prefix ?? "");
    }
    return this.createLogCallback("debug", "debug");
  }
  get groupCollapsed() {
    return this.createLogCallback("debug", "groupCollapsed");
  }
  get group() {
    return this.createLogCallback("debug", "group");
  }
  get groupEnd() {
    return console.groupEnd;
  }
  get table() {
    return this.createLogCallback("debug", "table");
  }

  /** Mute/Unmute the logger. */
  public mute() {
    this.muted = true;
  }
  public unmute() {
    this.muted = false;
  }

  /** Get current stack */
  public get stack() {
    return () => {
      const stack = new Error().stack;
      return stack?.substring(stack.indexOf("\n"));
    };
  }

  public setRemoteService(service: RemoteLogger) {
    this.service = service;
  }
}

export const logger = new Logger("FMG");

export default logger;
