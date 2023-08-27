declare namespace MG {
    interface Action {
        type: string;
        meta?: any;
        payload?: any;
    }

    interface Store {
        dispatch(action: Action): void;
        subscribe(cb: () => void): void;
        getState(): State;
    }
}
