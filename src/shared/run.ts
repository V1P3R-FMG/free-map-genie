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
        .then(() => logger.log(`FMG ${name} context initialized.`))
        .catch((e) => {
            success = false;
            if (e instanceof ChannelRequestError) {
                logger.error(`Failed to initialize ${name} context reason,`, e.message, "Data", e.data);
            } else if (e instanceof Error) {
                logger.error(`Failed to initialize ${name} context reason,`, e.message);
            } else {
                logger.error(`Failed to initialize ${name} context reason,`, e);
            }
        });
    return success;
}
