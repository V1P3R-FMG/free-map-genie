import { isEmpty } from "@shared/utils";

describe("isEmpty", () => {
    it("should return true when value is empty or nullable, and false otherwise", () => {
        expect(isEmpty({})).not.toBeFalsy();
        expect(isEmpty({ a: 1 })).toBeFalsy();
        expect(isEmpty([])).not.toBeFalsy();
        expect(isEmpty([1])).toBeFalsy();
        expect(isEmpty("")).not.toBeFalsy();
        expect(isEmpty("Hello World")).toBeFalsy();
        expect(isEmpty(null)).not.toBeFalsy();
        expect(isEmpty(undefined)).not.toBeFalsy();
        expect(isEmpty(0)).not.toBeFalsy();
        expect(isEmpty(1)).toBeFalsy();
        expect(isEmpty(-1)).toBeFalsy();
        expect(isEmpty(false)).not.toBeFalsy();
        expect(isEmpty(true)).toBeFalsy();
    });
});
