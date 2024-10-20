export function getNumber(name: keyof IProcessEnv): number | undefined;
export function getNumber(name: keyof IProcessEnv, dflt: number): number;
export function getNumber(name: keyof IProcessEnv, dflt?: number) {
    if (name in process.env) {
        return Number(process.env[name]);
    }
    return dflt;
}

export function getString(name: keyof IProcessEnv): string | undefined;
export function getString(name: keyof IProcessEnv, dflt: string): string;
export function getString(name: keyof IProcessEnv, dflt?: string): string | undefined {
    if (name in process.env) {
        return process.env[name];
    }
    return dflt;
}

export function getJsonStringify(name: keyof IProcessEnv): string | undefined;
export function getJsonStringify(name: keyof IProcessEnv, dflt: string): string;
export function getJsonStringify(name: keyof IProcessEnv, dflt?: string): string | undefined {
    if (name in process.env) {
        return JSON.stringify(process.env[name]);
    }
    return dflt;
}
