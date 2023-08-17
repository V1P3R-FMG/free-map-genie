class Logger {
    private name: string;
    private muted: boolean;

    constructor(name: string) {
        this.name = name;
        this.muted = false;
    }

    get prefix() {
        return `%c%s%c%s%c`;
    }

    get timestamp() {
        //return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

        return new Date().toTimeString().split(" ")[0];
    }

    get commonCss() {
        return {
            "border-radius": "3px",
            padding: "0 5px",
            margin: "2px",
            color: "white",
            "font-weight": "bolder"
        };
    }

    get timeCss() {
        return {
            background: "#333333"
        };
    }

    get infoCss() {
        return {
            background: "#0390fc"
        };
    }

    get warnCss() {
        return {
            background: "#fcba03"
        };
    }

    get errorCss() {
        return {
            background: "#ff3333"
        };
    }

    private compileCss(css: Record<string, string>): string {
        return (
            Object.entries(Object.assign(this.commonCss, css))
                .map(([key, value]) => `${key}:${value}`)
                .join(";") + ";"
        );
    }

    get log() {
        if (this.muted) return () => {};
        return console.log.bind(
            console,
            // Timestamp
            this.prefix,
            this.compileCss(this.timeCss),
            this.timestamp,
            // Log type
            this.compileCss(this.infoCss),
            this.name,
            ""
        );
    }

    get warn() {
        if (this.muted) return () => {};
        return console.warn.bind(
            console,
            // Timestamp
            this.prefix,
            this.compileCss(this.timeCss),
            this.timestamp,
            // Log type
            this.compileCss(this.warnCss),
            this.name,
            ""
        );
    }

    get error() {
        if (this.muted) return () => {};
        return console.error.bind(
            console,
            // Timestamp
            this.prefix,
            this.compileCss(this.timeCss),
            this.timestamp,
            // Log type
            this.compileCss(this.errorCss),
            this.name,
            ""
        );
    }

    mute() {
        this.muted = true;
    }

    unmute() {
        this.muted = false;
    }
}

module.exports = new Logger("FMG");
