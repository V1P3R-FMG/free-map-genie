import StorageFilter, { type StorageFilterCallback } from "@shared/storage-filter";

function createWindow(): any {
    let storage: Record<string, string> = {};

    const prototype = {
        getItem(key: string) {
            return storage[key];
        },
        setItem(key: string, value: string) {
            storage[key] = value;
        },
        removeItem(key: string) {
            delete storage[key];
        },
        clear() {
            storage = {};
        },
    };

    global.Storage = { prototype } as any;

    return {
        localStorage: Object.setPrototypeOf({}, prototype),
    };
}

describe("StorageFilter", () => {
    let window: Window;

    beforeEach(() => (window = createWindow()));

    it("should only install once per window instance", () => {
        const filterA = StorageFilter.install(window);
        const filterB = StorageFilter.install(window);
        const filterC = StorageFilter.install(createWindow());

        expect(filterA).toBe(filterB);
        expect(filterA).not.toBe(filterC);
    });

    it("should be able to be uninstalled from a window instance", () => {
        // Initialize Data
        const original = {
            setItem: window.localStorage.setItem,
            getItem: window.localStorage.getItem,
            removeItem: window.localStorage.removeItem,
        };

        // Setup A
        StorageFilter.install(window);

        // Expectations A
        expect(window.localStorage.setItem).not.toBe(original.setItem);
        expect(window.localStorage.getItem).not.toBe(original.getItem);
        expect(window.localStorage.removeItem).not.toBe(original.removeItem);

        // Setup B
        StorageFilter.uninstall(window);

        // Expectations B
        expect(window.localStorage.setItem).toBe(original.setItem);
        expect(window.localStorage.getItem).toBe(original.getItem);
        expect(window.localStorage.removeItem).toBe(original.removeItem);
    });

    it("should not change the prototype of the storage object", () => {
        StorageFilter.install(window);

        expect(global.Storage.prototype).toBe(Object.getPrototypeOf(window.localStorage));
        expect(window.localStorage.setItem).toBeDefined();
        expect(window.localStorage.getItem).toBeDefined();
        expect(window.localStorage.removeItem).toBeDefined();
        expect(window.localStorage.clear).toBeDefined();
    });

    it("should register a filter", () => {
        // Initialize Data
        const filter = StorageFilter.install(window);

        // Setup
        filter.registerFilter("set", /test/, () => {});
        filter.registerFilter("get", /test/, () => {});
        filter.registerFilter("remove", /test/, () => {});

        // Expectations
        expect(filter["filters"]["set"]["/test/"]).toBeDefined();
        expect(filter["filters"]["get"]["/test/"]).toBeDefined();
        expect(filter["filters"]["remove"]["/test/"]).toBeDefined();
    });

    it("should only register a filter once", () => {
        // Initialize Data
        const filter = StorageFilter.install(window);

        // Setup
        filter.registerFilter("set", /test/, () => {});
        filter.registerFilter("set", "", () => {});

        // Expectations
        expect(() => {
            filter.registerFilter("set", "test", () => {});
        }).toThrow("Filter already exists for set /test/");
        expect(() => {
            filter.registerFilter("set", /test/, () => {});
        }).toThrow("Filter already exists for set /test/");

        expect(() => {
            filter.registerFilter("set", "", () => {});
        }).toThrow("Filter already exists for set /(?:)/");
        expect(() => {
            filter.registerFilter("set", /(?:)/, () => {});
        }).toThrow("Filter already exists for set /(?:)/");
    });

    it("should unregister a filter", () => {
        // Initialize Data
        const filter = StorageFilter.install(window);

        // Setup
        filter.registerFilter("set", /test/, () => {});
        filter.unregisterFilter("set", /test/);

        // Expectations
        expect(filter["filters"]["set"]["/test/"]).toBeUndefined();
    });

    it("should match a filter", () => {
        // Initialize Data
        const filter = StorageFilter.install(window);
        const fnSet = () => {};
        const fnGet = () => {};
        const fnRemove = () => {};

        // Setup
        filter.registerFilter("set", /test_(?<id>\d+)/, fnSet);
        filter.registerFilter("get", /test_(?<id>\d+)/, fnGet);
        filter.registerFilter("remove", /test_(?<id>\d+)/, fnRemove);

        // Expectations
        const resultSet = filter["getFilter"]("set", "test_123");
        expect(resultSet).toBeDefined();
        expect(resultSet?.regex).toEqual(/test_(?<id>\d+)/);
        expect(resultSet?.callback).toBe(fnSet);

        const resultGet = filter["getFilter"]("get", "test_123");
        expect(resultGet).toBeDefined();
        expect(resultGet?.regex).toEqual(/test_(?<id>\d+)/);
        expect(resultGet?.callback).toBe(fnGet);

        const resultRemove = filter["getFilter"]("remove", "test_123");
        expect(resultRemove).toBeDefined();
        expect(resultRemove?.regex).toEqual(/test_(?<id>\d+)/);
        expect(resultRemove?.callback).toBe(fnRemove);
    });

    it("should call the correct filter", () => {
        // Initialize Data
        const filter = StorageFilter.install(window);

        const fnSet = jest.fn();
        const fnGet = jest.fn();
        const fnRemove = jest.fn();

        // Setup
        filter.registerFilter("set", /test_(?<id>\d+)/, fnSet);
        filter.registerFilter("get", /test_(?<id>\d+)/, fnGet);
        filter.registerFilter("remove", /test_(?<id>\d+)/, fnRemove);

        // Expectations
        window.localStorage.setItem("test_123", "test");
        expect(fnSet).toHaveBeenCalledTimes(1);
        expect(fnGet).toHaveBeenCalledTimes(0);
        expect(fnRemove).toHaveBeenCalledTimes(0);
        [fnSet, fnGet, fnRemove].forEach((fn) => fn.mockReset());

        window.localStorage.getItem("test_123");
        expect(fnSet).toHaveBeenCalledTimes(0);
        expect(fnGet).toHaveBeenCalledTimes(1);
        expect(fnRemove).toHaveBeenCalledTimes(0);
        [fnSet, fnGet, fnRemove].forEach((fn) => fn.mockReset());

        window.localStorage.removeItem("test_123");
        expect(fnSet).toHaveBeenCalledTimes(0);
        expect(fnGet).toHaveBeenCalledTimes(0);
        expect(fnRemove).toHaveBeenCalledTimes(1);
        [fnSet, fnGet, fnRemove].forEach((fn) => fn.mockReset());
    });

    it("should return the result of the filter when block is called", () => {
        // Initialize Data
        const filter = StorageFilter.install(window);
        const fn = ((_1, _2, _3, _4, _5, block) => {
            block();
            return "Hello, World";
        }) as StorageFilterCallback<any>;

        // Setup
        filter.registerFilter("get", "test", fn);

        // Expectations
        window.localStorage.setItem("test", "test");

        expect(window.localStorage.getItem("test")).toBe("Hello, World");
    });
});
