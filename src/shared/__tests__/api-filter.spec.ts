import ApiFilter, { ApiFiltered, AxiosMethods, type AxiosMethod, type ApiFilterCallInfo } from "@shared/api-filter";

import * as array from "@utils/array";

interface MockWindow {
    axios: {
        [ApiFiltered]?: symbol;
        get: jest.Func;
        put: jest.Func;
        post: jest.Func;
        delete: jest.Func;
    };
}

function createMockWindow(): MockWindow & Window {
    return { axios: Object.assign({}, ...AxiosMethods.map((m: any) => ({ [m]: jest.fn() }))) } as any;
}

describe("ApiFilter", () => {
    describe("install", () => {
        let mockWindow: MockWindow & Window;

        beforeEach(() => (mockWindow = createMockWindow()));

        it("should install correctly", async () => {
            const entries = Object.entries(mockWindow.axios);

            await ApiFilter.install(mockWindow);

            expect(mockWindow.axios[ApiFiltered]).toBeDefined();

            for (const [key, method] of entries) {
                expect(method).not.toBe(mockWindow.axios[key as AxiosMethod]);
            }
        });

        it("should uninstall correctly", async () => {
            const entries = Object.entries(mockWindow.axios);

            await ApiFilter.install(mockWindow);
            await ApiFilter.uninstall(mockWindow);

            expect(mockWindow.axios[ApiFiltered]).toBeUndefined();

            for (const [key, method] of entries) {
                expect(method).toBe(mockWindow.axios[key as AxiosMethod]);
            }
        });

        it("should only install once per window", async () => {
            const filterA = await ApiFilter.install(mockWindow);
            const filterB = await ApiFilter.install(mockWindow);
            expect(filterA).toBe(filterB);
        });
    });

    describe("matching", () => {
        it("should match urls with no id correctly", () => {
            const regex = ApiFilter["compileToRegex"]({ type: "user", path: "saved/locations" });
            expect(regex.test("https://mapgenie.io/api/v1/user/saved/locations")).toBeTruthy();
            expect(regex.test("https://mapgenie.io/api/v1/user/saved/locations/37020")).toBeFalsy();
        });

        it("should match urls with an id correctly", () => {
            const regex = ApiFilter["compileToRegex"]({ type: "user", path: "location", hasId: true });
            expect(regex.test("https://mapgenie.io/api/v1/user/location")).toBeFalsy();
            expect(regex.test("https://mapgenie.io/api/v1/user/location/65020")).toBeTruthy();
        });
    });

    describe("filters", () => {
        let mockWindow: MockWindow & Window;
        let filter: ApiFilter;

        beforeEach(async () => {
            mockWindow = createMockWindow();
            filter = await ApiFilter.install(mockWindow);
        });

        it("should register a filter correctly", () => {
            filter.registerFilter("get", { path: "saved/locations" }, () => ({}));
            expect(filter["filters"]["get"].length).toEqual(1);
        });

        test.each([
            ["get", "api/v1/user/saved/locations/47", "a"] as const,
            ["get", "api/v1/user/saved/locations", "b"] as const,
            ["get", "api/v1/user/saved/presets", "c"] as const,
            ["post", "api/v1/user/saved/presets", "c"] as const,
            ["get", "api/v1/user/saved/categories", undefined] as const,
            ["post", "api/v1/user/saved/locations", undefined] as const,
        ])("should find the correct filter [%s]: %s", async (method, url, expected) => {
            filter.registerFilter("get", { path: "saved/locations", hasId: true }, () => ({ result: "a" }));
            filter.registerFilter("get", { path: "saved/locations" }, () => ({ result: "b" }));
            filter.registerFilter("any", { path: "saved/presets" }, () => ({ result: "c" }));

            const callback = filter["findFilter"](method, url)?.[0]?.callback;

            if (expected) {
                expect(callback).toBeDefined();

                const { result } = (await callback!({} as any)) ?? {};
                expect(result).toEqual(expected);
            } else {
                expect(callback).toBeUndefined();
            }
        });

        test.each([
            ["get", "api/v1/user/saved/locations/47", [1, 0, 0, 0]] as const,
            ["get", "api/v1/user/saved/locations", [0, 1, 0, 0]] as const,
            ["post", "api/v1/user/saved/locations", [0, 0, 1, 0]] as const,
            ["get", "api/v1/user/saved/categories", [0, 0, 0, 1]] as const,
            ["post", "api/v1/user/saved/categories", [0, 0, 0, 1]] as const,
        ])("should apply the correct filter for [%s]: %s", async (method, url, expected) => {
            const callbacks = array.createArray(4, () => jest.fn(() => ({})));

            filter.registerFilter("get", { path: "saved/locations", hasId: true }, callbacks[0]);
            filter.registerFilter("get", { path: "saved/locations" }, callbacks[1]);
            filter.registerFilter("post", { path: "saved/locations" }, callbacks[2]);
            filter.registerFilter("any", { path: "saved/categories" }, callbacks[3]);

            await filter["applyFilter"](method, url);
            expect(callbacks.map((cb) => cb.mock.calls.length)).toEqual(expected);
            jest.clearAllMocks();
        });

        test.each([
            ["get", "saved/locations", { username: "viper" }, undefined] as const,
            ["get", "saved/locations", { username: "viper" }, "20"] as const,
            ["get", "saved/locations", undefined, "20"] as const,
        ])("should pass the correct info [%s]: %s, data(%p), id(%p)", async (method, path, data, id) => {
            const cb = jest.fn((_: ApiFilterCallInfo) => ({}));

            const url = id ? `api/v1/user/${path}/${id}` : `api/v1/user/${path}`;

            const hasId = id !== undefined;

            filter.registerFilter(method, { path, hasId }, cb);
            await filter["applyFilter"](method, url, data);

            const info = cb.mock.lastCall?.[0];
            expect(info).toBeDefined();
            expect(info?.method).toEqual(method);
            expect(info?.url).toEqual(url);
            expect(info?.type).toEqual("user");
            expect(info?.path).toEqual(path);
            expect(info?.id).toEqual(id);
            expect(info?.postData).toEqual(data);
        });
    });
});
