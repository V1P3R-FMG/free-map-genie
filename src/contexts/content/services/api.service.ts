import ApiFilter from "@fmg/filters/api-filter";
import Key from "@content/storage/key";

import storageService from "@content/services/storage.service";

class ApiService {
    public async installFilter() {
        const filter = await ApiFilter.install(window);

        filter.registerFilter(["put", "delete"], { path: "locations", hasId: true }, async ({ id, method }) => {
            await storageService.update(Key.fromWindow(window), (data) => {
                data.locations.toggle(id!, method === "put");
            });
            return { block: true };
        });

        filter.registerFilter<{ category: number }>("post", { path: "categories" }, async ({ postData }) => {
            await storageService.update(Key.fromWindow(window), (data) => {
                data.categories.add(postData.category);
            });
            return { block: true };
        });

        filter.registerFilter("delete", { path: "categories", hasId: true }, async ({ id }) => {
            await storageService.update(Key.fromWindow(window), (data) => {
                data.categories.delete(id!);
            });
            return { block: true };
        });
    }
}

export default new ApiService();
