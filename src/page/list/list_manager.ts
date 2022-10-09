

export default class FMG_ListManager {

    public readonly window: MG.List.Window;
    public readonly document: Document;

    constructor(window: MG.List.Window) {

        this.window = window;
        this.document = window.document;

    }
}