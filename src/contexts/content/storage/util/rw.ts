export abstract class BaseWriter<Layout, Data> {
    public encode(data: Layout): string {
        return JSON.stringify(data);
    }

    public writeString(data: Data): Nullable<string> {
        const dataLayout = this.write(data);
        return dataLayout && this.encode(dataLayout);
    }

    public abstract write(data: Data): Nullable<Layout>;
}

export abstract class BaseReader<Layout, Data> {
    public abstract default: string;

    public decode(data: Nullable<string>): Layout {
        return JSON.parse(data ?? this.default);
    }

    public readString(data: Nullable<string>): Data {
        return this.read(this.decode(data));
    }

    public abstract read(_data: Layout): Data;
}
