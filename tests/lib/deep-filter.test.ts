import * as deepFilter from "deep-filter";
import { isNotEmpty } from "@shared/utils";

logger.log("hello world");

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

describe("deepFilter + isNotEmpty", () => {
    it("should copy all elements recursive", () => {
        const obj = createObj();
        const clone = deepFilter(obj, isNotEmpty);
        expect(clone).not.toBe(obj);
        expect(clone?.b).not.toBe(obj.b);
        expect(clone?.b).toEqual({ y: 6 });
        expect(clone?.e).not.toBe(obj.e);
        expect(clone?.e).toEqual(obj.e);
    });

    it("should remove nullable values", () => {
        const obj = createObj();
        const clone = deepFilter(obj, isNotEmpty);
        expect(clone?.c).toBeUndefined();
        expect(clone?.f).toBeUndefined();
        expect(clone?.g).toBeUndefined();
    });

    it("should return a empty object if all values are nullable", () => {
        expect(
            deepFilter(
                {
                    a: null,
                    b: 0,
                    c: "",
                    d: {}
                },
                isNotEmpty
            )
        ).toEqual({});
    });
});
