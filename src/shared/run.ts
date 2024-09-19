import { ChannelRequestError } from "./channel";

export interface RunContext {
    (): Promise<any> | any;
}

async function runContext(context: RunContext): Promise<any> {
    return await context();
}

export default async function runContexts(name: string, ...contexts: RunContext[]): Promise<boolean> {
    let success = true;
    await Promise.all(contexts.map(runContext))
        .then((results) => {
            if (results.every((r) => r === undefined || r)) {
                logging.log(`FMG ${name} context initialized.\n@ ${window.location.href}`);
            }
        })
        .catch((e) => {
            success = false;
            if (e instanceof ChannelRequestError) {
                logging.error(`Failed to initialize ${name} context reason,`, e.message, "Data", e.data, "\n", e.stack);
            } else if (e instanceof Error) {
                logging.error(`Failed to initialize ${name} context reason,`, e.message, e.stack);
            } else {
                logging.error(`Failed to initialize ${name} context reason,`, e);
            }
            if (__DEBUG__) debugger;
        });
    return success;
}
