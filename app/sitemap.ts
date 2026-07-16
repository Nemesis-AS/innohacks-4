import type { MetadataRoute } from "next";
import { EVENT } from "@/util/event";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: EVENT.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
