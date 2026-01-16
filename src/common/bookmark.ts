import type { PageType } from "@/common/mapgenie";

export interface ImageWithFallback {
  url: string;
  fallback: string;
}

export type ImageUrl = string | ImageWithFallback;

export interface Bookmark {
  title: string;
  url: string;
  preview: ImageUrl;
  icon?: ImageUrl;
  pageType: PageType;
  createdAt: number;
}
