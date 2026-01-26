import { z } from "zod";

import type { Reporter } from "../reporter";
import type { UserData } from "../..";

export type JsonFile<T> = {
  filename: string;
  content: T;
};

export type Group = {
  filenames: string[];
};

export type Save = {
  version: number | null;
  userId: number | null;
  games: Record<number, UserData>;
  filenames: string[];
};

export abstract class AbstractSaveReader<L extends z.ZodType, G extends Group> {
  protected readonly reporter: Reporter;

  constructor(reporter: Reporter) {
    this.reporter = reporter;
  }

  protected abstract schema: L;

  public abstract read(group: G): Save | null;

  public abstract group(saves: JsonFile<z.infer<L>>[]): G[];

  public abstract isSave(object: any): boolean;

  public parse(file: JsonFile<any>): JsonFile<z.infer<L>> | null {
    try {
      const filename = file.filename;
      const content = this.schema.parse(file.content);
      return { filename, content };
    } catch (err) {
      this.reporter.error(file.filename, err);
      return null;
    }
  }
}
