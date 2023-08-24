export class FMG_Keys {
    public readonly keyData: FMG.Storage.KeyData;

    constructor(keyData: FMG.Storage.KeyData) {
        this.keyData = keyData;
    }

    public get v1Key() {
        return FMG_Keys.getV1Key(this.keyData);
    }

    public get v2Key() {
        return FMG_Keys.getV2Key(this.keyData);
    }

    public get latestKey() {
        return FMG_Keys.getLatestKey(this.keyData);
    }

    static getV1Key(keyData: FMG.Storage.KeyData) {
        return `mg:game_${keyData.gameId}:user_${keyData.userId}:v5`;
    }

    static getV2Key(keyData: FMG.Storage.KeyData) {
        return `fmg:game_${keyData.gameId}:map_${keyData.mapId}:user_${keyData.userId}`;
    }

    static getLatestKey(keyData: FMG.Storage.KeyData) {
        return this.getV2Key(keyData);
    }
}
