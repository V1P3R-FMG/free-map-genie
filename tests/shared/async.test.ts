import { blockable } from "@shared/async";

describe("blockable", () => {
    const fnBlock = jest.fn((block) => {
        block();
        return "block";
    });

    const fnNonBlocked = jest.fn(() => "non-blocked");

    const fnBlockable = jest.fn(() => "blockable");

    beforeEach(() => {
        fnBlock.mockClear();
        fnNonBlocked.mockClear();
        fnBlockable.mockClear();
    });

    it("should block the callback if block gets called", async () => {
        await blockable(fnBlock).then(fnBlockable).catch(blockable.catcher);

        expect(fnBlock).toHaveBeenCalledTimes(1);
        expect(fnBlockable).not.toHaveBeenCalled();
    });

    it("should not block the callback if block does not get called", async () => {
        await blockable(fnNonBlocked)
            .then(fnBlockable)
            .catch(blockable.catcher);

        expect(fnNonBlocked).toHaveBeenCalledTimes(1);
        expect(fnBlockable).toHaveBeenCalledTimes(1);
    });

    it("should return the result of blocker if block gets called", async () => {
        const result = await blockable(fnBlock)
            .then(fnBlockable)
            .catch(blockable.catcher);

        expect(result).toBe("block");
    });

    it("should return the result of the callback if block does not get called", async () => {
        const result = await blockable(fnNonBlocked)
            .then(fnBlockable)
            .catch(blockable.catcher);

        expect(result).toBe("blockable");
    });

    it("should pass arguments to the blocker correctly", async () => {
        await blockable(fnNonBlocked, "Hello", "World")
            .then(fnBlockable)
            .catch(blockable.catcher);

        expect(fnNonBlocked).toHaveBeenCalledWith(
            "Hello",
            "World",
            expect.any(Function)
        );
    });

    it("should work without then/catch", async () => {
        let resultA, resultB;

        try {
            await blockable(fnBlock);
            resultA = fnBlockable();
        } catch (e) {
            resultA = await blockable.catcher(e);
        }

        try {
            await blockable(fnNonBlocked);
            resultB = fnBlockable();
        } catch (e) {
            resultB = await blockable.catcher(e);
        }

        expect(resultA).toBe("block");
        expect(resultB).toBe("blockable");
        expect(fnBlock).toHaveBeenCalledTimes(1);
        expect(fnNonBlocked).toHaveBeenCalledTimes(1);
        expect(fnBlockable).toHaveBeenCalledTimes(1);
    });
});
