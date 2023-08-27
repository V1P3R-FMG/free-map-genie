declare namespace ProxyObserve {
    interface AddChange {
        type: "add";
        name: string;
        oldValue: undefined;
        newValue: any;
    }

    interface UpdateChange {
        type: "update";
        name: string;
        oldValue: any;
        newValue: any;
    }

    interface DeleteChange {
        type: "delete";
        name: string;
        oldValue: any;
        newValue: undefined;
    }

    type Change = AddChange | UpdateChange | DeleteChange;
}

interface Object {
    observe<T extends object>(
        o: T,
        callback: (changes: ProxyObserve.Change[]) => void
    ): T;
    deepObserve<T extends object>(
        o: T,
        callback: (changes: ProxyObserve.Change[]) => void
    ): T;
}
