export default function reactive(o: object, onChange: (obj: Dict<any, any>, k: string|symbol, v: any) => void) {

    function helper(o: any, onChange: (obj: Dict<any, any>, k: string|symbol, v: any) => void) {
        if (typeof o !== "object")  return o;
    
        for (var [k, v] of Object.entries(o)) {
            (o as any)[k] = helper(v, onChange);
        }
    
        return new Proxy(o, {
            set(obj, key, value): boolean {
                (obj as any)[key] = helper(value, onChange);
                onChange(obj, key, value);
                return true;
            },
            deleteProperty(obj, key): boolean {
                delete (obj as any)[key];
                onChange(obj, key, undefined);
                return true;
            },
        })
    }

    return helper(o, onChange);
}