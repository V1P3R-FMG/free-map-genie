export class Logger {
    public readonly name: string;
    private muted = !__DEBUG__; // automatically mute in production

    public constructor(name: string) {
        this.name = name;
        this.muted = false;
    }

    public static format(msg: string, data: Record<string, any>) {
        return msg.replace(
            /\{\w+\}/g,
            (match) => data[match.slice(1, -1)]?.toString() ?? match
        );
    }

    /**
     * Info log.
     * @param args the arguments to log
     */
    public log(msg: any, data?: Record<string, any>) {
        if (this.muted) return () => {};
        console.log(
            `%c[${this.name}]%c %c` + Logger.format(msg.toString(), data ?? {}),
            "background: green; color: white;",
            "",
            "color: #56CAFF;"
        );
    }

    /**
     * Warning log.
     * @param args the arguments to log
     */
    public warn(msg: any, data?: Record<string, any>) {
        if (this.muted) return () => {};
        console.warn(
            `%c[${this.name}]%c %c` + Logger.format(msg.toString(), data ?? {}),
            "background: green; color: white;",
            "",
            "color: #FFDA2D;"
        );
    }

    /**
     * Error log.
     * @param args the arguments to log
     */
    public error(msg: any, data?: Record<string, any>) {
        if (this.muted) return () => {};
        console.error(
            `%c[${this.name}]%c %c` + Logger.format(msg.toString(), data ?? {}),
            "background: green; color: white;",
            "",
            "color: #FF4A4A;"
        );
    }

    /**
     * Mute log.
     */
    public mute() {
        this.muted = true;
    }

    /**
     * Unmute log.
     */
    public unmute() {
        this.muted = false;
    }
}
