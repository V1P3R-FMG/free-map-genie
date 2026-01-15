import type { PageType } from "@/common/mapgenie";

export interface Bookmark {
  title: string;
  url: string;
  preview: string;
  icon?: string;
  pageType: PageType;
  createdAt: number;
}
