const loggerPrefix = "%c[FMG]%c:";
const loggerCss = ["background:green;color:white;", ""];
const prefix = [loggerPrefix, ...loggerCss] as const;

logger = {} as any;

logger.log = console.log.bind(console, ...prefix);
logger.warn = console.warn.bind(console, ...prefix);
logger.error = console.error.bind(console, ...prefix);

logger.mute = () => {
    logger.log = () => {};
    logger.warn = () => {};
    logger.error = () => {};
};

logger.unmute = () => {
    logger.log = console.log.bind(console, ...prefix);
    logger.warn = console.warn.bind(console, ...prefix);
    logger.error = console.error.bind(console, ...prefix);
};

module.exports = logger;
