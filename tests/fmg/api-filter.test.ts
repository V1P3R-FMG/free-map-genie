import {
    FMG_ApiFilter,
    type ApiFilteredCallback,
    AxiosMethods
} from "@fmg/filters/api-filter";

type ApiFilteredCallbackArgs = Parameters<ApiFilteredCallback>;

const filters: [string, string][] = [
    ["test", "/api/v1/user/test"],
    ["test/a", "/api/v1/user/test/a"]
];

const ids: (string | undefined)[] = [undefined, "123"];

describe("FMG_ApiFilter", () => {
    const FnResult = 1;

    const fnBlock = jest.fn<number, ApiFilteredCallbackArgs>(
        (_1, _2, _3, _4, _5, block) => {
            block();
            return FnResult;
        }
    );

    const fnNonBlock = jest.fn<number, ApiFilteredCallbackArgs>(() => {
        return FnResult;
    });

    beforeEach(() => {
        fnBlock.mockClear();
        fnNonBlock.mockClear();
    });

    it("should only install once per axios instance", () => {
        // Initialize Data
        const windowMock = createWindow();

        // Setup
        const filterA = FMG_ApiFilter.install(windowMock);
        const filterB = FMG_ApiFilter.install(windowMock);
        const filterC = FMG_ApiFilter.install(createWindow());

        // Expectations
        expect(filterA).toBe(filterB);
        expect(filterA).not.toBe(filterC);
    });

    it("should register a filter", () => {
        // Initialize Data
        const filter = FMG_ApiFilter.install(createWindow());

        for (const method of AxiosMethods) {
            for (const [key, _] of filters) {
                // Setup
                filter.registerFilter(method, key, false, () => {});

                // Expectations
                expect(filter["filters"][method][key]).toBeDefined();
            }
        }
    });

    it("should only register a filter once", () => {
        // Initialize Data
        const filter = FMG_ApiFilter.install(createWindow());

        for (const method of AxiosMethods) {
            for (const [key, _] of filters) {
                // Setup
                filter.registerFilter(method, key, false, () => {});

                // Expectations
                expect(() => {
                    filter.registerFilter(method, key, false, () => {});
                }).toThrow(`Filter already exists for ${method} ${key}`);
            }
        }
    });

    it("should unregister a filter", () => {
        // Initialize Data
        const filter = FMG_ApiFilter.install(createWindow());

        for (const method of AxiosMethods) {
            for (const [key, _] of filters) {
                // Setup
                filter.registerFilter(method, key, false, () => {});
                filter.unregisterFilter(method, key);

                // Expectations
                expect(filter["filters"][method][key]).toBeUndefined();
                expect(() => {
                    filter.unregisterFilter(method, key);
                }).toThrow(`Filter does not exist for ${method} ${key}`);
                expect(() => {
                    filter.registerFilter(method, key, false, () => {});
                }).not.toThrow(`Filter already exists for ${method} ${key}`);
            }
        }
    });

    it("should compile a key to regex correctly", () => {
        for (const [key, url] of filters) {
            for (const id of ids) {
                // Setup
                const regex = FMG_ApiFilter["compileKeyToRegex"](
                    key,
                    id != undefined
                );
                const result = regex.exec(url + (id ? "/" + id : ""));
                // Expectations
                expect(result).not.toBeNull();
                expect(result?.groups?.key).toBe(key);
                expect(result?.groups?.id).toBe(id);
            }
        }
    });

    it("should overide the axios method", () => {
        // Initialize Data
        const windowMock = createWindow();
        const original = { ...windowMock.axios };
        FMG_ApiFilter.install(windowMock);

        for (const method of AxiosMethods) {
            // Expectations
            expect(original[method]).not.toBe(windowMock.axios[method]);
        }
    });

    it("should match url correctly whit no id", async () => {
        // Initialize Data
        const filter = FMG_ApiFilter.install(createWindow());

        for (const method of AxiosMethods) {
            for (const [key, url] of filters) {
                // Setup
                const fn = () => {};
                filter.registerFilter(method, key, false, fn);

                const matchA = filter["getFilter"](method, url);
                const matchB = filter["getFilter"](method, url + "/1");
                const matchC = filter["getFilter"](method, url + "/a");
                const matchD = filter["getFilter"](method, url + "/a/1");

                // Expectations
                expect(matchA).toBeDefined();
                expect(matchB).toBeUndefined();
                expect(matchA?.callback).toBe(fn);

                expect(matchC).toBeUndefined();
                expect(matchD).toBeUndefined();
            }
        }
    });

    it("should return the result from the filter when block is called", async () => {
        // Initialize Data
        const windowMock = createWindow();
        const original = { ...windowMock.axios };
        const filter = FMG_ApiFilter.install(windowMock);

        for (const method of AxiosMethods) {
            for (const [key, url] of filters) {
                for (const id of ids) {
                    // Setup
                    filter.registerFilter(
                        method,
                        key,
                        id != undefined,
                        fnBlock
                    );

                    const result = await windowMock.axios[method](
                        url + (id ? "/" + id : "")
                    );

                    // Expectations
                    expect(fnBlock).toBeCalledTimes(1);
                    expect(original[method]).toBeCalledTimes(0);
                    expect(result).toBe(FnResult);

                    // Cleanup
                    original[method].mockClear();
                    fnBlock.mockClear();
                    filter.unregisterFilter(method, key);
                }
            }
        }
    });

    it("should return the result from the original method when block is never called", async () => {
        // Initialize Data
        const windowMock = createWindow();
        const original = { ...windowMock.axios };
        const filter = FMG_ApiFilter.install(windowMock);

        for (const method of AxiosMethods) {
            for (const [key, url] of filters) {
                for (const id of ids) {
                    // Setup
                    filter.registerFilter(
                        method,
                        key,
                        id != undefined,
                        fnNonBlock
                    );

                    const result = await windowMock.axios[method](
                        url + (id ? "/" + id : "")
                    );

                    // Expectations
                    expect(result).toBe(method);
                    expect(fnNonBlock).toBeCalledTimes(1);
                    expect(original[method]).toBeCalledTimes(1);

                    // Cleanup
                    original[method].mockClear();
                    fnNonBlock.mockClear();
                    filter.unregisterFilter(method, key);
                }
            }
        }
    });

    it("should call the original axios when no filter is registered", async () => {
        // Initialize Data
        const windowMock = createWindow();
        const original = { ...windowMock.axios };
        FMG_ApiFilter.install(windowMock);

        for (const method of AxiosMethods) {
            for (const [_, url] of filters) {
                for (const id of ids) {
                    // Setup
                    const result = await windowMock.axios[method](
                        url + (id ? "/" + id : "")
                    );

                    // Expectations
                    expect(fnBlock).toBeCalledTimes(0);
                    expect(original[method]).toBeCalledTimes(1);
                    expect(result).toBe(method);

                    // Cleanup
                    original[method].mockClear();
                    fnBlock.mockClear();
                }
            }
        }
    });

    it("should call the original axios when no filter matches", async () => {
        // Initialize Data
        const windowMock = createWindow();
        const original = { ...windowMock.axios };
        const filter = FMG_ApiFilter.install(windowMock);

        for (const method of AxiosMethods) {
            for (const [key, url] of filters) {
                for (const id of ids) {
                    // Setup
                    filter.registerFilter(
                        method,
                        key,
                        id != undefined,
                        fnBlock
                    );

                    const result = await windowMock.axios[method](
                        url + "/a" + (id ? "/" + id : "")
                    );

                    // Expectations
                    expect(fnBlock).toBeCalledTimes(0);
                    expect(original[method]).toBeCalledTimes(1);
                    expect(result).toBe(method);

                    // Cleanup
                    original[method].mockClear();
                    fnBlock.mockClear();
                    filter.unregisterFilter(method, key);
                }
            }
        }
    });

    it("should pass the correct arguments to the callbacks", async () => {
        // Initialize Data
        const windowMock = createWindow();
        const filter = FMG_ApiFilter.install(windowMock);
        const postData = { a: 1, b: 2 };

        for (const method of AxiosMethods) {
            for (const [key, url] of filters) {
                for (const id of ids) {
                    // Setup
                    filter.registerFilter(
                        method,
                        key,
                        id != undefined,
                        (method, key, id, data, url, block) => {
                            block();
                            return [method, key, id, data, url];
                        }
                    );

                    // Expectations
                    expect(
                        await windowMock.axios[method](
                            url + (id ? "/" + id : ""),
                            postData
                        )
                    ).toEqual([
                        method,
                        key,
                        id,
                        postData,
                        url + (id ? "/" + id : "")
                    ]);

                    // Cleanup
                    filter.unregisterFilter(method, key);
                }
            }
        }
    });

    it("should if no filter has been found search in any for a filter", async () => {
        // Initialize Data
        const windowMock = createWindow();
        const filter = FMG_ApiFilter.install(windowMock);

        // Setup
        filter.registerFilter(
            "any",
            "test",
            false,
            (_1, _2, _3, _4, _5, block) => {
                block();
                return "any works!";
            }
        );

        // Expectations
        expect(await windowMock.axios.get("/api/v1/user/test")).toBe(
            "any works!"
        );
    });

    it("should not use any filter if a filter with correct method has been found", async () => {
        // Initialize Data
        const windowMock = createWindow();
        const filter = FMG_ApiFilter.install(windowMock);

        // Setup
        filter.registerFilter(
            "get",
            "test",
            false,
            (_1, _2, _3, _4, _5, block) => {
                block();
                return "get works!";
            }
        );
        filter.registerFilter(
            "any",
            "test",
            false,
            (_1, _2, _3, _4, _5, block) => {
                block();
                return "any works!";
            }
        );

        // Expectations
        expect(await windowMock.axios.get("/api/v1/user/test")).toBe(
            "get works!"
        );
    });
});
