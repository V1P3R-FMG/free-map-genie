import { Reporter } from "../reporter";

import { SaveReaderV1 } from "./v1";
import { SaveReaderV2 } from "./v2";
import { SaveReaderV3 } from "./v3";

import type { SerializedFile } from "../file";
import type { JsonFile, AbstractSaveReader, Save } from "./abstract";

type Faulty = {
  file: JsonFile<any>;
  version: number | null;
};

export class SaveReader {
  private readonly reporter = new Reporter();

  private faulty: Faulty[] = [];

  private readonly readers: Record<number, AbstractSaveReader<any, any>> = {
    1: new SaveReaderV1(this.reporter),
    2: new SaveReaderV2(this.reporter),
    3: new SaveReaderV3(this.reporter),
  };

  public readJsons(files: SerializedFile[]) {
    const jsons: JsonFile<any>[] = [];

    for (const file of files) {
      try {
        const json = JSON.parse(file.content);
        jsons.push({ filename: file.filename, content: json });
      } catch (err) {
        this.reporter.error(file.filename, err);
        this.faulty.push({ file, version: null });
      }
    }
    return jsons;
  }

  public parseJson(jsons: JsonFile<any>[]) {
    const parsedJsons: Record<number, JsonFile<any>[]> = {};

    for (const json of jsons) {
      for (const version in this.readers) {
        const reader = this.readers[version];

        if (reader.isSave(json.content)) {
          const parsed = reader.parse(json);
          if (parsed) {
            parsedJsons[version] ??= [];
            parsedJsons[version].push(parsed);
          } else {
            this.faulty.push({ file: json, version: Number(version) });
          }
        }
      }
    }

    return parsedJsons;
  }

  private faultySave({ file, version }: Faulty): Save {
    return {
      filenames: [file.filename],
      version: version,
      userId: null,
      games: {},
    };
  }

  public read(files: SerializedFile[]) {
    const jsons = this.readJsons(files);
    const parsedJsons = this.parseJson(jsons);

    const saves = [];

    for (const faulty of this.faulty) {
      saves.push(this.faultySave(faulty));
    }

    for (const version in parsedJsons) {
      const reader = this.readers[version];
      const files = parsedJsons[version];

      const groups = reader.group(files);

      for (const saveGroup of groups) {
        const save = reader.read(saveGroup);
        if (save) {
          saves.push(save);
        }
      }
    }

    this.faulty = [];

    return {
      saves,
      errors: this.reporter.collect(),
    };
  }
}
