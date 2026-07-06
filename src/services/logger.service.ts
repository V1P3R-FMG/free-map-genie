import { createService } from "@/common/messaging";
import { Logger } from "@/common/logger";

class LoggerService {
  private readonly loggers = new Map<string, Logger>();

  private getLogger(entrypoint: string): Logger {
    if (!this.loggers.has(entrypoint)) {
      const logger = new Logger("FMG", entrypoint);
      this.loggers.set(entrypoint, logger);
      return logger;
    }
    return this.loggers.get(entrypoint)!;
  }

  public log(entrypoint: string, ...args: any): void {
    const entrypointLogger = this.getLogger(entrypoint);
    entrypointLogger.log.apply(entrypointLogger, args);
  }

  public error(entrypoint: string, ...args: any): void {
    const entrypointLogger = this.getLogger(entrypoint);
    entrypointLogger.error.apply(entrypointLogger, args);
  }

  public warn(entrypoint: string, ...args: any): void {
    const entrypointLogger = this.getLogger(entrypoint);
    entrypointLogger.warn.apply(entrypointLogger, args);
  }

  public debug(entrypoint: string, ...args: any): void {
    const entrypointLogger = this.getLogger(entrypoint);
    entrypointLogger.debug.apply(entrypointLogger, args);
  }
}

export const contentLoggerService = createService({
  context: LoggerService,
  namespace: "ContentLoggerService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

export namespace contentLoggerService {
  export type Instance = createService.User<typeof LoggerService>;
}

export const backgroundLoggerService = createService({
  context: LoggerService,
  namespace: "BackgroundLoggerService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

export namespace backgroundLoggerService {
  export type Instance = createService.User<typeof LoggerService>;
}

export type LoggerServiceInstance = createService.User<typeof LoggerService>;
