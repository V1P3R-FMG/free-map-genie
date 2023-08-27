import { isEmpty } from "@shared/utils";
import type { FMG_Keys } from "../keys";

export class FMG_ExportHelper {
    static getFileName(keyData: FMG.Storage.KeyData) {
        return `fmg_game_${keyData.gameId}_map_${keyData.mapId}_user_${
            keyData.userId
        }_${new Date().toISOString()}.json`;
    }

    static async export(driver: FMG.Storage.Driver, keys: FMG_Keys) {
        const data = await driver.get<FMG.Storage.V2.StorageObject>(
            keys.latestKey
        );

        if (isEmpty(data)) {
            alert("No data to export");
            return;
        }

        const json: FMG.Storage.V2.ExportedJson = {
            version: 2,
            gameId: parseInt(keys.keyData.gameId as string),
            mapId: parseInt(keys.keyData.mapId as string),
            userId: parseInt(keys.keyData.userId as string),
            data
        };

        const blob = new Blob([JSON.stringify(json)], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = this.getFileName(keys.keyData);
        a.click();
        URL.revokeObjectURL(url);
    }
}
