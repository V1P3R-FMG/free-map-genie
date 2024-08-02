export default class WindowStorageDriver implements Driver {
    private readonly win: Window;

    public constructor(win?: Window) {
        this.win = win ?? window;
    }

    public async has(key: string) {
        return this.win.localStorage.getItem(key) !== null;
    }

    public async get(key: string) {
        return this.win.localStorage.getItem(key);
    }

    public async set(key: string, value: string) {
        this.win.localStorage.setItem(key, value);
    }

    public async remove(key: string) {
        this.win.localStorage.removeItem(key);
    }

    public async keys() {
        return Object.keys(this.win.localStorage);
    }
}
