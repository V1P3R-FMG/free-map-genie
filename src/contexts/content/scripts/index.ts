export default interface PageScript {
    initScript(): Promise<void> | void;
}
