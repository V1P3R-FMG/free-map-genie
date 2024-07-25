declare namespace MG {
    declare type StateActionType =
        | MG.StateMapAction
        | MG.StateUserAction
        | MG.StateSearchAction;

    declare type StateActionsMap = MG.Actions.UserStateActionsMap &
        MG.Actions.MapStateActionsMap &
        MG.Actions.RouteStateActionsMap;
}
