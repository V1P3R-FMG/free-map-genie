declare module "deep-filter" {
    function deepFilter<T extends object>(
        object: T,
        filter: (value: any, prop: string, subject: object) => boolean
    ): T;

    namespace deepFilter {}

    export = deepFilter;
}
