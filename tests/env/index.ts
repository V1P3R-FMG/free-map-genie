global.__DEBUG__ = true;
global.__MAX_BACKUPS_COUNT__ = 10;

import { TestEnvironment } from "jest-environment-node";
import { Logger } from "../../src/logger";

import fsService, { FsService } from "./services/fs.service";
import jsonService, { JsonService } from "./services/json.service";

declare global {
    /* eslint-disable no-var */

    var fsService: FsService;
    var jsonService: JsonService;

    /* eslint-enable no-var */
}

export default class FMGTestEnvironment extends TestEnvironment {
    async setup() {
        await super.setup();

        this.global.logger = new Logger();
        this.global.fsService = fsService;
        this.global.jsonService = jsonService;

        this.global.window = global as any;
    }
}
