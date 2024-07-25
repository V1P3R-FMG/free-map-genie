const _console = global.console;

export type ConsoleMethodName = "log" | "error" | "warn" | "trace";

export type LogMethodName = "info" | "warn" | "error" | "debug";

export type CssStyleEntryName =
    | "common"
    | "timestamp"
    | "message"
    | "info"
    | "warn"
    | "error"
    | "debug";

export interface CssStyleEntryValue {
    color?: string;
    background?: string;
    fontWeight?: string;
    margin?: string;
    padding?: string;
    borderRadius?: string;
}

export type CssStyleMap = Record<CssStyleEntryName, CssStyleEntryValue>;

export interface ConsoleLogTemplateTag {
    value: string | (() => string);
    style: string;
}

export interface ConsoleLogTemplateOptions {
    common?: CssStyleEntryValue;
    timestamp?: CssStyleEntryValue;
}

/**
 * Template class to create a formated message.
 * To pass down to a console method.
 */
export class ConsoleLogTemplate {
    private readonly tags: ConsoleLogTemplateTag[] = [];
    private readonly commonCss: CssStyleEntryValue;
    private readonly messageStyle: string;

    public constructor(
        common?: CssStyleEntryValue,
        message?: CssStyleEntryValue
    ) {
        this.commonCss = common ?? {};
        this.messageStyle = this.compileCss(message ?? {});
    }

    /**
     * Adds a tag in fron of the template.
     * @param value the text of the tag.
     * @param css the style of the tag.
     */
    public addTag(value: string | (() => string), css?: CssStyleEntryValue) {
        this.tags.push({
            value,
            style: this.compileCss(css ?? {}),
        });
    }

    /**
     * Creates a string format for the console method.
     * @returns the string format.
     */
    private createTemplateFormatString(): string {
        return this.tags.map((_) => "%c%s").join("") + "%c";
    }

    /**
     * Compiles a css object to a css string.
     * @param css the css to compile.
     * @returns the css object as a string form.
     */
    private compileCss(css: CssStyleEntryValue): string {
        return Object.entries({ ...this.commonCss, ...css })
            .map(
                ([prop, value]) => `${this.transformKebabCase(prop)}:${value};`
            )
            .join("");
    }

    /**
     * Transforms a prop name to kebab case.
     * @param prop the prop to transform.
     * @returns the transformed prop.
     */
    private transformKebabCase(prop: string): string {
        return prop.replace(/(.)?([A-Z])/g, (_, pre, sub) => {
            return (pre ? pre + "-" : "") + sub.toLowerCase();
        });
    }

    /**
     * Extract all the tags in to a single concurent array of `tag.style` and `tag.value`.
     * @returns the concurent array of `tag.style` and `tag.value`.
     */
    private extractTags(): string[] {
        return this.tags
            .map((tag) => [
                tag.style,
                typeof tag.value === "string" ? tag.value : tag.value(),
            ])
            .flat(1);
    }

    /**
     * Compiles into a array of parameters that need to be passed down to the console method.
     * @returns a array of parameters.
     */
    public compile(): any[] {
        return [
            this.createTemplateFormatString(),
            ...this.extractTags(),
            this.messageStyle,
        ];
    }
}

/**
 * Logger class with a bit more style to it.
 */
export class Logger {
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
        message: {},
        info: { background: "#0390fc", color: "#eee" },
        warn: { background: "#faaf00", color: "#eee" },
        error: { background: "#ff3333", color: "#eee" },
        debug: { background: "#8b32ba", color: "#eee" },
    });

    protected readonly infoTemplate!: ConsoleLogTemplate;
    protected readonly warnTemplate!: ConsoleLogTemplate;
    protected readonly errorTemplate!: ConsoleLogTemplate;
    protected readonly debugTemplate!: ConsoleLogTemplate;

    public constructor(
        name?: string,
        prefix?: string,
        prefixCss?: CssStyleEntryValue
    ) {
        this.muted = !__DEBUG__; // automatically mute in production;

        for (const logName of ["info", "warn", "error", "debug"] as const) {
            const template = new ConsoleLogTemplate(
                this.css.common,
                this.css.message
            );

            template.addTag(Logger.getTimestamp, this.css.timestamp);

            if (name) template.addTag(name, this.css[logName]);
            if (prefix) template.addTag(prefix, prefixCss);

            this[`${logName}Template`] = template;
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
        if (this.muted || (name === "debug" && !__DEBUG__))
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
        return _console[method].bind(
            _console,
            ...this[`${name}Template`].compile()
        );
    }

    /** Logger methods. */
    get log() {
        return this.createLogCallback("info", "log");
    }
    get warn() {
        return this.createLogCallback("warn", "warn");
    }
    get error() {
        return this.createLogCallback("error", "error");
    }
    get debug() {
        return this.createLogCallback("debug", "log");
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
            const stack = (new Error()).stack;
            return stack?.substring(stack.indexOf("\n"));
        }
    }
}

const logger = new Logger("FMG");
// const winConsole = new Logger();

// // Overwrite console method with logger methods.
// global.console = new Proxy(console, {
//     get(trgt, field) {
//         if (field in winConsole) return winConsole[field as keyof Logger];
//         return trgt[field as keyof Console];
//     }
// });

export default logger;
