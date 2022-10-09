type StorageOldDataLoaded = Array<number>;

//----------------- [V3] -----------------//

type StorageDataObject_V3 = {
    locations: MG.DictById<boolean>,
    categories: MG.DictById<boolean>,
}

type LocalStorageDataObject_V3 = Partial<StorageDataObject_V3>;

type StorageSettingsObject_V3 = {
    remember_categories: boolean
}

type LocalStorageSettingsObject_V3 = Partial<StorageSettingsObject_V3>;

type StorageObject_V3 = {
    data: StorageDataObject_V3,
    settings: StorageSettingsObject_V3
}

type LocalStorageObject_V3 = {
    data?: LocalStorageDataObject_V3,
    settings?: LocalStorageSettingsObject_V3
}

//----------------- [V4] -----------------//

type StorageDataObject_V4 = {
    locations: MG.DictById<boolean>,
    categories: MG.DictById<boolean>,
    presets: MG.DictById<MG.Preset>,
    presets_order: MG.PresetOrder,
    visible_categories: Dict<number, boolean>
}

type LocalStorageDataObject_V4 = Partial<StorageDataObject_V4>;

type StorageSettingsObject_V4 = {
    remember_categories: boolean
}

type LocalStorageSettingsObject_V4 = Partial<StorageSettingsObject_V4>;

type StorageObject_V4 = {
    data: StorageDataObject_V4,
    settings: StorageSettingsObject_V4,
    old_data_loaded: Array<number> // mapIds
}


type LocalStorageObject_V4 = {
    data?: LocalStorageDataObject_V4,
    settings?: LocalStorageSettingsObject_V4,
    old_data_loaded?: StorageOldDataLoaded // mapIds
}

type JSONGameData_V4 = {
    gameid: number,
    userid: number,
    mapdata: LocalStorageObject_V4
}

type JSONGameDataWithVersion_V4 = JSONGameData_V4 & { version: "v4" }

//----------------- [V5] -----------------//

type StorageSharedDataObject_v5 = {
    locations: MG.DictById<boolean>,
}

type LocalStorageSharedDataObject_v5 = Partial<StorageSharedDataObject_v5>;

type StorageMapDataObject_V5 = {
    categories: MG.DictById<boolean>,
    presets: MG.DictById<MG.Preset>,
    presets_order: MG.PresetOrder,
    visible_categories: Dict<number, boolean>
}

type LocalStorageMapDataObject_V5 = Partial<StorageMapDataObject_V5>;

type LocalStorageDataObject_V5 = Spread<[LocalStorageSharedDataObject_v5, LocalStorageMapDataObject_V5]>;
type StorageDataObject_V5 = Spread<[StorageSharedDataObject_v5, StorageMapDataObject_V5]>;

type StorageSettingsObject_V5 = {
    remember_categories: boolean
}

type LocalStorageSettingsObject_V5 = Partial<StorageSettingsObject_V5>;

type StorageObject_V5 = {
    sharedData: StorageSharedDataObject_v5,
    mapData: MG.DictById<StorageMapDataObject_V5>,
    settings: MG.DictById<StorageSettingsObject_V5>
}

type LocalStorageObject_V5 = {
    sharedData?: LocalStorageSharedDataObject_v5,
    mapData?: MG.DictById<LocalStorageMapObject_V5>,
    settings?: MG.DictById<LocalStorageSettingsObject_V5>,
}

type JSONGameData_V5 = {
    version: "v5",
    gameId: number,
    mapId: number,
    userId: number,
    storageObject?: LocalStorageObject_V5,
    v4StorageObject?: LocalStorageObject_V4
}