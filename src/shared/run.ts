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
            logger.error(`Failed to initalize ${name} context reason,`, e);
        });
    return success;
}
