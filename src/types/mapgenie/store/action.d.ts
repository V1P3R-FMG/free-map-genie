declare namespace MG {
  declare type StateMapAction = keyof Actions.MapStateActionsMap;
  declare type StateUserAction = keyof Actions.UserStateActionsMap;
  declare type StateSearchAction = keyof Actions.SearchStateActionsMap;

  declare type StateActions =
    | StateMapAction
    | StateUserAction
    | StateSearchAction;

  declare type Action<T extends StateActions = StateActions> = {
    type: T;
    meta: Actions.StateActionsMap[T];
  };
}
