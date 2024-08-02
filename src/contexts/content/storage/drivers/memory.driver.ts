export default class MemoryDriver implements Driver {
    private readonly memory: Record<string, string> = {};

    public constructor(initial?: Record<string, string>) {
        this.memory = initial ? { ...initial } : {};
    }

    public async has(key: string) {
        return key in this.memory;
    }

    public async get(key: string) {
        return this.memory[key] ?? null;
    }

    public async set(key: string, value: string) {
        this.memory[key] = value;
    }

    public async remove(key: string) {
        delete this.memory[key];
    }

    public async keys() {
        return Object.keys(this.memory);
    }
}
