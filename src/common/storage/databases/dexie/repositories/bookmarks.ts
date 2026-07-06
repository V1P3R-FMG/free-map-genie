import { AbstractRepository } from "./abstract";

import type { ImageUrl } from "@/common/bookmark";
import type { PageType } from "@/common/mapgenie";

export interface BookmarkModelV1 {
  url: string;
  title: string;
  preview: ImageUrl;
  icon?: ImageUrl;
  pageType: PageType;
  createdAt: string;
}

export class BookmarksRepositoryV1 extends AbstractRepository<
  BookmarkModelV1,
  string
> {
  public readonly tableName = "bookmarks";
  public readonly index = "url, createdAt";

  public async add(bookmark: BookmarkModelV1) {
    return this.table.add(bookmark);
  }

  public async delete(url: string) {
    await this.table.where({ url }).delete();
  }

  public async clear() {
    await this.table.clear();
  }

  public async get() {
    return this.table.toArray();
  }
}
