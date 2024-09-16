export default class Lazy<T> {
    private _value?: T;

    public constructor(private init: () => T) {}

    public get value() {
        return (this._value ??= this.init());
    }
}
