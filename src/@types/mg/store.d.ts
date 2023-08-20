declare namespace MG {
    type ActionType =
        | import("@fmg/actions").MapAction
        | import("@fmg/actions").UserAction
        | import("@fmg/actions").SearchAction;

    interface Action {
        type: ActionType | string;
        meta?: any;
    }

    interface Store {
        dispatch(action: Action): void;
        subscribe(cb: () => void): void;
        getState(): State;
    }
}
