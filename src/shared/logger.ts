export class Logger {
    public readonly name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public static format(msg: string, data: Record<string, any>) {
        return msg.replace(
            /\{\w+\}/,
            (match) => data[match.slice(1, -1)]?.toString() ?? match
        );
    }

    /**
     * Info log.
     * @param args the arguments to log
     */
    public log(msg: any, data?: Record<string, any>) {
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
        console.error(
            `%c[${this.name}]%c %c` + Logger.format(msg.toString(), data ?? {}),
            "background: green; color: white;",
            "",
            "color: #FF4A4A;"
        );
    }
}
