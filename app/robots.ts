import type { MetadataRoute } from "next";
import { EVENT } from "@/util/event";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${EVENT.url}/sitemap.xml`,
  };
}
