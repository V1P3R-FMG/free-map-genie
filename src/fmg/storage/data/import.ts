import { isNotEmpty } from "@shared/utils";
import type { FMG_Keys } from "../keys";
import { FMG_StorageDataMigrator } from "../migration";

type ExportedJson = FMG.Storage.V1.ExportedJson | FMG.Storage.V2.ExportedJson;

export class FMG_ImportHelper {
    public static async showFilePicker(): Promise<File | undefined> {
        const input = document.createElement("input");
        document.body.appendChild(input);
        input.style.display = "none";
        input.type = "file";
        input.accept = ".json";
        input.click();

        return new Promise((resolve) => {
            input.onchange = () => {
                const file = input.files?.[0];
                resolve(file);
                document.body.removeChild(input);
            };
        });
    }

    public static async import(driver: FMG.Storage.Driver, keys: FMG_Keys, json: string) {
        // Get the current data
        const currentData = await driver.get(keys.latestKey);

        // If our current data is not empty, ask the user if they want to overwrite it
        if (isNotEmpty(currentData)) {
            const result = confirm(
                "Are you sure you want to overwrite your current data?"
            );
            if (!result) return;
        }

        // Remove the current data
        await driver.remove(keys.latestKey);

        try {
            // Read the file and parse it
            const data = JSON.parse(json) as ExportedJson & {
                mapId?: number;
            };

            // If the game or map id is not the same, throw an error
            const { gameId, mapId, userId } = data;
            if (gameId !== keys.keyData.gameId) {
                window.toastr.error(`Data does not belong to current game. Got gameId ${gameId}, expexted gameId ${keys.keyData.gameId}`);
                throw new Error("Invalid game id");
            } else if (mapId && mapId !== keys.keyData.mapId) {
                window.toastr.error(`Data does not belong to current map. Got mapId ${mapId}, expexted mapId ${keys.keyData.mapId}`);
                throw new Error("Invalid map id");
            }

            // If the user id is not the same, ask the user if they want to continue
            if (userId !== keys.keyData.userId) {
                const result = confirm(
                    "The user id does not match, do you want to continue?"
                );
                if (!result) return;
            }

            // Check the version and handle it
            if (data.version === "v5") {
                await driver.set(keys.v1Key, data.storageObject);
                await FMG_StorageDataMigrator.migrateLegacyData(window);
            } else if (data.version === 2) {
                await driver.set(keys.v2Key, data.data);
            } else {
                throw new Error("Unknown version");
            }
        } catch {
            // Restore the current data, If we failed to import
            if (isNotEmpty(currentData)) {
                await driver.set(keys.v2Key, currentData);
            }
        }
    }
}
