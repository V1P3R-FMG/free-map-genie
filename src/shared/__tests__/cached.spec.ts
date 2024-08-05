import CachedValue from "@shared/cached";

jest.useFakeTimers();

interface FetchOptions {
    headers: Record<string, string>;
}

const fetchMock = jest.fn((_src: string, _options: FetchOptions) => response("mocked"));

function response(value: any): any {
    return Promise.resolve({
        text: () => Promise.resolve(JSON.stringify(value)),
        json: () => Promise.resolve(value),
    });
}

global.fetch = fetchMock as any;

describe("CachedValue", () => {
    beforeEach(() => {
        fetchMock.mockClear();
    });

    it("should be able to fetch data", async () => {
        fetchMock.mockReturnValueOnce(response("hello"));

        const cached = new CachedValue("https://test.com");

        await expect(cached.data).resolves.toBe("hello");
    });

    it("should be keep the value cached", async () => {
        fetchMock.mockReturnValueOnce(response("hello"));

        const cached = new CachedValue("https://test.com", { maxAge: 5000 });

        await expect(cached.data).resolves.toBe("hello");

        await expect(cached.data).resolves.toBe("hello");
    });

    it("should re-fetch the value after the age expires", async () => {
        fetchMock.mockReturnValueOnce(response("hello"));

        const cached = new CachedValue("https://test.com", { maxAge: 5000 });

        await expect(cached.data).resolves.toBe("hello");

        jest.setSystemTime(jest.now() + 6000);

        await expect(cached.data).resolves.toBe("mocked");
    });

    it("should call fetch with the correct headers", async () => {
        const headers = { hello: "world" };

        const cached = new CachedValue("https://test.com", { headers });

        await cached.data;

        expect(fetchMock.mock.calls[0]?.[1].headers).toEqual(headers);
    });
});
