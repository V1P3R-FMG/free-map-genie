function confirmImportFromDifferentUser(userId: number) {
    return confirm(`This map data belongs to another user(${userId}). Are you sure you want to load it?`);
}

export default class FMG_JSONMapDataFileReader extends FileReader {

    private _current: Promise<any>;
    private readonly _gameId : number;
    private readonly _userId : number;

    constructor(window: MG.Map.Window) {
        super();

        this._gameId = window.game.id;
        this._userId = window.user.id;
    
        this._current = Promise.resolve();
    }

    readAsText(blob: Blob, encoding?: string | undefined): Promise<JSONGameDataWithVersion_V4 | JSONGameData_V5 | null> {
        this._current = this._current.then(() => new Promise((resolve, reject) => {
            this.onload = (e) => {
                try {
                    const jsonObject: Partial<JSONGameDataWithVersion_V4 | JSONGameData_V5> = JSON.parse(e.target?.result?.toString() || "{}");
                    if (typeof jsonObject !== "object") return reject("JSON is not a valid JSON map data Object");

                    jsonObject.version = jsonObject.version || "v4";

                    //TODO: validate storageObject/mapdata object
                    switch(jsonObject.version) {
                        case "v4":
                            if (typeof jsonObject.mapdata !== "object") return reject("JSON file doesn't contain valid map/storage data");
                            if (this._gameId != jsonObject.gameid)      return reject("JSON file is not for this game");

                            if (this._userId != jsonObject.userid && !confirmImportFromDifferentUser(jsonObject.userid || -1)) return resolve(null); 
                            break

                        case "v5":
                            if (typeof (jsonObject.storageObject || jsonObject.v4StorageObject) !== "object")   return reject("JSON file doesn't contain valid map/storage data");
                            if (this._gameId != jsonObject.gameId)                                              return reject("JSON file is not for this game");

                            if (this._userId != jsonObject.userId && !confirmImportFromDifferentUser(jsonObject.userId || -1)) return resolve(null); 
                            break

                        default:
                            return reject("JSON has not a valid version");
                    }

                    return resolve(jsonObject);

                } catch (e) {
                    return reject(`Invalid JSON file: ${e}`);
                }
            }
        }));
        super.readAsText(blob, encoding);
        return this._current;
    }
}