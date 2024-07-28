import fs from "./fs.service";

export class JsonService {
    public readJson<T>(path: string): T {
        return JSON.parse(fs.readFile(path, "utf-8"));
    }

    public async readJsonAsync<T>(path: string): Promise<T> {
        const data = await fs.readFileAsync(path, "utf-8");
        return JSON.parse(data);
    }
}

export default new JsonService();
