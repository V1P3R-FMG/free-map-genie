global.__DEBUG__ = true;
global.__MAX_BACKUPS_COUNT__ = 10;
global.__CACHE_MAX_AGE__ = 30 * 60 * 1000;

import { TestEnvironment } from "jest-environment-node";
import { Logger } from "../../src/logging";

import fsService, { type FsService } from "./services/fs.service";
import jsonService, { type JsonService } from "./services/json.service";

declare global {
    /* eslint-disable no-var */

    var fsService: FsService;
    var jsonService: JsonService;

    /* eslint-enable no-var */
}

export default class FMGTestEnvironment extends TestEnvironment {
    async setup() {
        await super.setup();

        this.global.logging = new Logger();
        this.global.fsService = fsService;
        this.global.jsonService = jsonService;

        this.global.window = global as any;
    }
}
