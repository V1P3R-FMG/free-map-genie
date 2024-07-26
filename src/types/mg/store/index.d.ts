declare namespace MG {
    declare type StateActionType = StateMapAction | StateUserAction | StateSearchAction;

    declare type MetaForActionType<T extends StateActionType> = T extends StateMapAction
        ? Actions.MapStateActionsMap[T]
        : T extends StateUserAction
          ? Actions.UserStateActionsMap[T]
          : T extends StateSearchAction
            ? Actions.SearchStateActionsMap[T]
            : never;
}
