import CachedValue from "@utils/cached";

jest.useFakeTimers();

const fetchMock = jest.fn(() => response("mocked"));

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

        const cached = new CachedValue("https://test.com", 5000);

        await expect(cached.data).resolves.toBe("hello");

        await expect(cached.data).resolves.toBe("hello");
    });

    it("should re-fetch the value after the age expires", async () => {
        fetchMock.mockReturnValueOnce(response("hello"));

        const cached = new CachedValue("https://test.com", 5000);

        await expect(cached.data).resolves.toBe("hello");

        jest.setSystemTime(jest.now() + 6000);

        await expect(cached.data).resolves.toBe("mocked");
    });
});
