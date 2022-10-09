export default function isEmpty(obj: object): boolean {
    for (const _ in obj) return false;
    return true;
}