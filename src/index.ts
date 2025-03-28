declare global {
    const __HOSTNAME__: string;
    const __PORT__: number;
    const __WATCH__: boolean;
    const __BROWSER__: string;
    const __MODE__: string;
    const __DEBUG__: boolean;
    const __VERSION__: string;
    const __AUTHOR__: string;
    const __HOMEPAGE__: string;
    
    const __GLOBAL_API_SECRET__: string;

    let logger: Logger;
}

export {};
