import { expect } from "@jest/globals";
import NumberSet, { type NumberSetLayout } from "@utils/set";

import * as rw from "@utils/rw.js";

describe("rw.js", () => {
    describe("writing", () => {
        /** rw.writeArray() */
        it("should write an array when not empty", () => {
            const obj: { a?: number[] } = {};

            rw.writeArray(obj, "a", [1, 2, 3]);

            expect("a" in obj).toBe(true);

            expect(obj.a).toEqual([1, 2, 3]);
        });

        /** rw.writeArray() */
        it("should not write an array when empty", () => {
            const obj: { a?: number[] } = {};

            rw.writeArray(obj, "a", []);

            expect("a" in obj).toBe(false);
        });

        /** rw.writeRecord() */
        it("should write a record when not empty", () => {
            const obj: { a?: { b?: number } } = {};

            rw.writeRecord(obj, "a", { b: 1 });

            expect("a" in obj).toBe(true);

            expect(obj.a).toEqual({ b: 1 });
        });

        /** rw.writeRecord() */
        it("should not write a record when empty", () => {
            const obj: { a?: { b?: number } } = {};

            rw.writeRecord(obj, "a", {});

            expect("a" in obj).toBe(false);
        });

        /** rw.writeBoolean() */
        it("should write a boolean when its not the default", () => {
            const obj: { a?: boolean; b?: boolean } = {};

            rw.writeBoolean(obj, "a", true);
            rw.writeBoolean(obj, "b", false, true);

            expect("a" in obj).toBe(true);
            expect("b" in obj).toBe(true);

            expect(obj.a).toBe(true);
            expect(obj.b).toBe(false);
        });

        /** rw.writeBoolean() */
        it("should not write a boolean when its the default", () => {
            const obj: { a?: boolean; b?: boolean } = {};

            rw.writeBoolean(obj, "a", false);
            rw.writeBoolean(obj, "b", true, true);

            expect("a" in obj).toBe(false);
            expect("b" in obj).toBe(false);
        });

        /** rw.writeNumberSet() */
        it("should write a NumberSet when not empty", () => {
            const obj: { a?: NumberSetLayout } = {};

            rw.writeNumberSet(obj, "a", NumberSet.new([1, 2, 3]));

            expect("a" in obj).toBe(true);

            expect(obj.a).toEqual([1, 2, 3]);
        });

        /** rw.writeNumberSet() */
        it("should not write a NumberSet when empty", () => {
            const obj: { a?: NumberSetLayout } = {};

            rw.writeNumberSet(obj, "a", NumberSet.new());

            expect("a" in obj).toBe(false);
        });

        /** rw.writeIndexableSetToRecordSet() */
        it("should write a NumberSet as Record<string, boolean> when not empty", () => {
            const obj: { a?: Record<string, boolean> } = {};

            rw.writeIndexableSetToRecordSet(obj, "a", NumberSet.new([1, 2, 3]));

            expect("a" in obj).toBe(true);

            expect(obj.a).toEqual({ "1": true, "2": true, "3": true });
        });

        /** rw.writeIndexableSetToRecordSet() */
        it("should not write a NumberSet as Record<string, boolean> when empty", () => {
            const obj: { a?: Record<string, boolean> } = {};

            rw.writeIndexableSetToRecordSet(obj, "a", NumberSet.new());

            expect("a" in obj).toBe(false);
        });
    });

    describe("reading", () => {
        it("should read a boolean and provide the default if undefined", () => {
            expect(rw.readBoolean(true)).toBe(true);
            expect(rw.readBoolean(false)).toBe(false);
            expect(rw.readBoolean(undefined)).toBe(false);
            expect(rw.readBoolean(undefined, true)).toBe(true);
            expect(rw.readBoolean(undefined, false)).toBe(false);
        });

        it("should read a NumberSet and provide an empty NumberSet if undefined", () => {
            expect(rw.readNumberSet([])).toEqual(NumberSet.new());
            expect(rw.readNumberSet([1, 2, 3])).toEqual(NumberSet.new([1, 2, 3]));
            expect(rw.readNumberSet(undefined)).toEqual(NumberSet.new());
        });

        it("should read a Record<string, boolean> to NumberSet and provide an empty NumberSet if undefined", () => {
            expect(rw.readRecordSetToNumberSet({})).toEqual(NumberSet.new());
            expect(rw.readRecordSetToNumberSet({ "1": true, "2": true, "3": true })).toEqual(NumberSet.new([1, 2, 3]));
            expect(rw.readRecordSetToNumberSet(undefined)).toEqual(NumberSet.new());
        });
    });
});
