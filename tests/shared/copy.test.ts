import { shallowCopy, deepCopy, minimizedCopy } from "@shared/copy";

function createObj() {
    return {
        a: 1,
        b: { x: false, y: 6 },
        c: { z: "" },
        d: "hello world",
        e: [1, 2, 3],
        f: [null],
        g: []
    };
}

describe("shallowCopy", () => {
    it("should copy all elements non recursive", () => {
        const obj = createObj();
        const clone = shallowCopy(obj);
        expect(clone).toEqual(obj);
        expect(clone).not.toBe(obj);
        expect(clone.b).toBe(obj.b);
        expect(clone.e).toBe(obj.e);
    });
});

describe("deepCopy", () => {
    it("should copy all elements recursive", () => {
        const obj = createObj();
        const clone = deepCopy(obj);
        expect(clone).toEqual(obj);
        expect(clone).not.toBe(obj);
        expect(clone.b).not.toBe(obj.b);
        expect(clone.b).toEqual(obj.b);
        expect(clone.e).not.toBe(obj.e);
        expect(clone.e).toEqual(obj.e);
        expect(Object.getPrototypeOf(clone.e)).toBe(Array.prototype);
    });
});

describe("minimizedCopy", () => {
    it("should copy all elements recursive", () => {
        const obj = createObj();
        const clone = minimizedCopy(obj);
        expect(clone).not.toBe(obj);
        expect(clone?.b).not.toBe(obj.b);
        expect(clone?.b).toEqual({ y: 6 });
        expect(clone?.e).not.toBe(obj.e);
        expect(clone?.e).toEqual(obj.e);
    });

    it("should remove nullable values", () => {
        const obj = createObj();
        const clone = minimizedCopy(obj);
        expect(clone?.c).toBeUndefined();
        expect(clone?.f).toBeUndefined();
        expect(clone?.g).toBeUndefined();
    });

    it("should return undefined if all values are nullable", () => {
        expect(
            minimizedCopy({
                a: null,
                b: 0,
                c: "",
                d: {}
            })
        ).toBeUndefined();
    });
});
