import { SaveReader } from "./reader";
import { SaveWriter } from "./writer";

import type { SerializedFile } from "./file";
import type { UserData } from "../format";

export type { Save } from "./reader/abstract";

export class SaveHelper {
  private readonly reader = new SaveReader();
  private readonly writer = new SaveWriter();

  public read(files: SerializedFile[]) {
    return this.reader.read(files);
  }

  public write(userId: number, games: Record<number, UserData>) {
    return this.writer.write(userId, games);
  }

  public download(file: SerializedFile) {
    this.writer.download(file);
  }
}
