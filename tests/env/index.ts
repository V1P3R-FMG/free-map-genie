import { TestEnvironment } from "jest-environment-node";

global.__DEBUG__ = true;

import { Logger } from "../../src/logger";

import fsService, { FsService } from "./services/fs.service";
import jsonService, { JsonService } from "./services/json.service";

declare global {
    /* eslint-disable no-var */

    var fsService: FsService;
    var jsonService: JsonService;

    var logger: Logger;

    var __DEBUG__: boolean;

    /* eslint-enable no-var */
}

export default class FMGTestEnviroment extends TestEnvironment {
    async setup() {
        await super.setup();

        this.global.logger = new Logger();
        this.global.fsService = fsService;
        this.global.jsonService = jsonService;
    }
}
