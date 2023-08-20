const _console = window.console;

/**
 * Logger history class.
 */
class LoggerHistory {
    private history: [string, any[]][] = [];
    private enabled: boolean = false;

    public addEntry(name: string, args: any[]) {
        if (!this.enabled) return;
        this.history.push([name, args]);
    }

    public save() {
        _console.log(this.history);
        // TODO: Open file dialog and save history
    }

    public enable() {
        this.enabled = true;
    }

    public disable() {
        this.enabled = false;
    }
}

/**
 * Logger class for all fmg related logging.
 * This class can keep a history of all logs made by the fmg extension, if enabled.
 */
class Logger {
    private name: string | undefined;
    private muted: boolean;
    private history: LoggerHistory;

    public constructor(name?: string) {
        this.name = name;
        this.muted = !__DEBUG__; // automatically mute in production;
        this.history = new LoggerHistory();
    }

    private get prefix() {
        if (!this.name) return `%c%s%c`;
        return `%c%s%c%s%c`;
    }

    private get timestamp() {
        return new Date().toTimeString().split(" ")[0];
    }

    private get commonCss() {
        return {
            "border-radius": "3px",
            padding: "0 5px",
            margin: "2px",
            color: "white",
            "font-weight": "bolder"
        };
    }

    private get timeCss() {
        return {
            color: "#b5b5b5",
            background: "none",
            "font-weight": "normal"
        };
    }

    private get infoCss() {
        return {
            background: "#0390fc"
        };
    }

    private get warnCss() {
        return {
            background: "#fcba03"
        };
    }

    private get errorCss() {
        return {
            background: "#ff3333"
        };
    }

    /**
     * Console log method.
     */
    get log() {
        return this.createLogCallback("log");
    }

    /**
     * Console warn method.
     */
    get warn() {
        return this.createLogCallback("warn");
    }

    /**
     * Console error method.
     */
    get error() {
        return this.createLogCallback("error");
    }

    /**
     * Creates a callback for the given console method.
     * @param name the name of the console method
     * @returns the created console callback
     */
    private createLogCallback(name: string): (...args: any[]) => void {
        // If we are muted, return a empty interceptor that returns a empty function
        if (this.muted) return () => () => {};

        // Return the wrapped log method
        return this.intercept(
            name,
            (_console[name as keyof Console] as any).bind(
                _console,
                // Timestamp
                this.prefix,
                this.compileCss(this.timeCss),
                this.timestamp,
                // Log type
                ...(!this.name ? [] : [this.getLoggerCss(name), this.name, ""])
            )
        );
    }

    /**
     * Wraps the callback and intercepts the arguments.
     * @param callback the callback to wrap
     * @returns the wrapped callback
     */
    private intercept(name: string, callback: (...args: any[]) => void) {
        return (...args: any[]) => {
            this.history.addEntry(name, args);
            return callback.bind(_console, ...args);
        };
    }

    /**
     * Get the css for the given console method.
     * @param name the name of the console method
     * @returns the css string for the given console method
     */
    private getLoggerCss(name: string): string {
        switch (name) {
            case "log":
                return this.compileCss(this.infoCss);
            case "warn":
                return this.compileCss(this.warnCss);
            case "error":
                return this.compileCss(this.errorCss);
            default:
                return "";
        }
    }

    /**
     * Compiles a css object to a css string.
     * @param css the css to compile
     */
    private compileCss(css: Record<string, string>): string {
        return (
            Object.entries(Object.assign(this.commonCss, css))
                .map(([key, value]) => `${key}:${value}`)
                .join(";") + ";"
        );
    }

    /** Mute the logger */
    public mute() {
        this.muted = true;
    }

    /** Unmute the logger */
    public unmute() {
        this.muted = false;
    }

    /** Enable log history */
    public enableHistory() {
        this.history.enable();
    }

    /** Disable log history */
    public disableHistory() {
        this.history.disable();
    }

    /** Save log history */
    public save() {
        this.history.save();
    }
}

module.exports = new Logger("FMG");
