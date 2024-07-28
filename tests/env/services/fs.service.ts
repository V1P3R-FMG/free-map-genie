import nodePath from "node:path";
import fs from "node:fs";

export class FsService {
    public readonly root = nodePath.join(__dirname, "..", "data");

    public readFile(path: string): Buffer;
    public readFile(path: string, encoding: BufferEncoding): string;
    public readFile(path: string, encoding?: BufferEncoding) {
        return fs.readFileSync(nodePath.resolve(this.root, path), { encoding });
    }

    public readFileAsync(path: string): Promise<Buffer>;
    public readFileAsync(path: string, encoding: BufferEncoding): Promise<string>;
    public readFileAsync(path: string, encoding?: BufferEncoding) {
        return fs.promises.readFile(nodePath.resolve(this.root, path), { encoding });
    }
}

export default new FsService();
