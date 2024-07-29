import NumberSet from "@utils/set.js";

const stringArray = (...arr: number[]) => arr.map(String);
const numberArray = (...arr: number[]) => arr;

describe.each([
    ["string", stringArray],
    ["number", numberArray],
])("NumberSet with %s values", (_, defineArray) => {
    describe("initialization", () => {
        /** NumberSet.new */
        it("should be creatable from an array", () => {
            const set = NumberSet.new(defineArray(1, 2, 3));
            expect(set.values()).toEqual([1, 2, 3]);
        });
    });

    describe("operations", () => {
        /** NumberSet.size */
        test.each([
            [1, defineArray(5)],
            [6, defineArray(5, 6, 7, 1, 2, 3)],
            [3, defineArray(20, 7, 6)],
        ])("should give the correct size for an array with length %i", (length, array) => {
            const set = NumberSet.new(array);
            expect(set.size).toBe(length);
        });

        /** NumberSet.values() */
        test.each([
            [defineArray(1, 2, 3), [1, 2, 3]],
            [defineArray(3, 5, 20, 3), [3, 5, 20]],
        ])("should give the correct values %p", (array, expected) => {
            const set = NumberSet.new(array);
            expect(set.values()).toEqual(expected);
        });

        /** NumberSet.toggle(i) */
        test.each([[defineArray(1, 2, 3, 6), [3, 4, 6], [1, 2, 4]]])(
            "should NumberSet.toggle values",
            (array, indexes, expected) => {
                const set = NumberSet.new(array);

                for (const index of indexes) {
                    set.toggle(index);
                }

                expect(set.values()).toEqual(expected);
            }
        );

        /** NumberSet.toggle(i, true) */
        test.each([[defineArray(1, 2, 3, 6), [3, 4, 6], [1, 2, 3, 4, 6]]])(
            "should add values when NumberSet.toggle is called with true",
            (array, indexes, expected) => {
                const set = NumberSet.new(array);

                for (const index of indexes) {
                    set.toggle(index, true);
                }

                expect(set.values().sort()).toEqual(expected.sort());
            }
        );

        /** NumberSet.toggle(i, false) */
        test.each([[defineArray(1, 2, 3, 6), [3, 4, 6], [1, 2]]])(
            "should remove values when NumberSet.toggle is called with false",
            (array, indexes, expected) => {
                const set = NumberSet.new(array);

                for (const index of indexes) {
                    set.toggle(index, false);
                }

                expect(set.values().sort()).toEqual(expected.sort());
            }
        );

        /** NumberSet.add(i) */
        test.each([[defineArray(1, 2, 3), 3]])("should add values", (indexes, length) => {
            const set = NumberSet.new();

            for (const index of indexes) {
                set.add(index);
            }

            expect(set.size).toBe(length);
        });

        /** NumberSet.delete(i) */
        test.each([[defineArray(1, 2, 3)]])("should remove values", (indexes) => {
            const set = NumberSet.new(indexes);

            for (const index of indexes) {
                set.delete(index);
            }

            expect(set.size).toBe(0);
        });

        /** NumberSet.has(i) */
        test.each([
            [
                defineArray(1, 3),
                [
                    [1, true] as [number, boolean],
                    [2, false] as [number, boolean],
                    [3, true] as [number, boolean],
                    [4, false] as [number, boolean],
                ],
            ],
        ])(
            "should give if exists true or false when it doesn't exist when NumberSet.has is called",
            (array, expected) => {
                const set = NumberSet.new(array);

                for (const [index, bool] of expected) {
                    expect(set.has(index)).toEqual(bool);
                }
            }
        );
    });

    describe("indexing", () => {
        /** NumberSet[i] */
        test.each([[defineArray(1, 2, 3), [1, 2, 3]]])("should be indexable", (array, indexes) => {
            const set = NumberSet.new(array);

            for (const index of indexes) {
                expect(set[index]).toBe(true);
            }
        });

        /** NumberSet[i] = true */
        test.each([[defineArray(1, 2, 3), 3]])("should add values via index", (indexes, length) => {
            const set = NumberSet.new();

            for (const index of indexes) {
                set[index] = true;
                expect(set[index]).toBe(true);
            }

            expect(set.size).toEqual(length);
        });

        /** NumberSet[i] = false */
        test.each([[defineArray(1, 2, 3)]])("should remove values via index", (indexes) => {
            const set = NumberSet.new(indexes);

            for (const index of indexes) {
                set[index] = false;
                expect(set[index]).toBe(false);
            }

            expect(set.size).toEqual(0);
        });

        /** NumberSet[i] = any */
        it("should error when setting a value other than a boolean", () => {
            const set = NumberSet.new();

            expect(() => (set[1] = "1" as any)).toThrow("Expected boolean value");
            expect(() => (set[1] = 50 as any)).toThrow("Expected boolean value");
            expect(() => (set[1] = {} as any)).toThrow("Expected boolean value");
            expect(() => (set[1] = [] as any)).toThrow("Expected boolean value");
        });
    });

    describe("iterating", () => {
        it("should be iterable with in", () => {
            const array = [6, 20, 3, 76];

            const set = NumberSet.new(defineArray(...array));

            const iter = array.values();

            for (const index in set) {
                expect(index).toBe(String(iter.next().value));
            }
        });

        it("should work with Object.keys()", () => {
            const array = [6, 20, 3, 76];

            const set = NumberSet.new(defineArray(...array));

            expect(Object.keys(set).sort()).toEqual(array.map(String).sort());
        });

        it("should work with Object.values()", () => {
            const array = [6, 20, 3, 76];

            const set = NumberSet.new(defineArray(...array));

            expect(Object.values(set)).toEqual(array.map(() => true));
        });

        it("should work with Object.entries()", () => {
            const array = [6, 20, 3, 76];

            const set = NumberSet.new(defineArray(...array));

            expect(Object.entries(set).sort()).toEqual(array.map((i) => [String(i), true]).sort());
        });
    });
});

describe("NumberSet statics", () => {
    /** NumberSet.isIndexableSet */
    it("should give true for NumberSet's and false for any oter value when NumberSet.isIndexableSet is called", () => {
        expect(NumberSet.isIndexableSet([1, 2, 3])).toBe(false);
        expect(NumberSet.isIndexableSet(["1", "2", "3"])).toBe(false);
        expect(NumberSet.isIndexableSet(1)).toBe(false);
        expect(NumberSet.isIndexableSet("1")).toBe(false);
        expect(NumberSet.isIndexableSet({ 1: true })).toBe(false);

        expect(NumberSet.isIndexableSet(NumberSet.new([1, 2, 3]))).toBe(true);
        expect(NumberSet.isIndexableSet(NumberSet.new(["1", "2", "3"]))).toBe(true);
    });
});
