import MemoryDriver from "../memory.driver";

describe("MemoryDriver", () => {
    it("should be able to get values", async () => {
        const driver = new MemoryDriver({ a: "1", b: "2" });

        await expect(driver.get("a")).resolves.toBe("1");
        await expect(driver.get("b")).resolves.toBe("2");
        await expect(driver.get("c")).resolves.toBe(null);
    });

    it("should be able to set values", async () => {
        const driver = new MemoryDriver({ a: "1", b: "2" });

        await driver.set("a", "3");
        await driver.set("c", "5");

        await expect(driver.get("a")).resolves.toBe("3");
        await expect(driver.get("b")).resolves.toBe("2");
        await expect(driver.get("c")).resolves.toBe("5");
    });

    it("should be able to remove values", async () => {
        const driver = new MemoryDriver({ a: "1", b: "2" });

        await driver.remove("a");

        await expect(driver.get("a")).resolves.toBe(null);
        await expect(driver.get("b")).resolves.toBe("2");
    });

    it("should be able to indicate if a value exists", async () => {
        const driver = new MemoryDriver({ a: "1", b: "2" });

        await driver.remove("a");

        await expect(driver.has("a")).resolves.toBe(false);
        await expect(driver.has("b")).resolves.toBe(true);
        await expect(driver.has("c")).resolves.toBe(false);
    });

    it("should be able to give all the keys", async () => {
        const driver = new MemoryDriver({ a: "1", b: "2" });

        expect(driver.keys().then((keys) => keys.sort())).resolves.toEqual(["a", "b"]);
    });
});
