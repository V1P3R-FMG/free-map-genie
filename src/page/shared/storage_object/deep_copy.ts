export default function deepCopy<T extends object=object>(o: T): T {
    return JSON.parse(JSON.stringify(o));
}