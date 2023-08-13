import { Logger } from "@shared/logger";

declare global {
    const logger: Logger & { name: "FMG" };
}

const fmgLogger = new Logger("FMG");

export function log(msg: any, data?: Record<string, any>): void {
    fmgLogger.log(msg, data);
}

export function warn(msg: any, data?: Record<string, any>): void {
    fmgLogger.warn(msg, data);
}

export function error(msg: any, data?: Record<string, any>): void {
    fmgLogger.error(msg, data);
}

export function mute(): void {
    fmgLogger.mute();
}

export function unmute(): void {
    fmgLogger.unmute();
}
