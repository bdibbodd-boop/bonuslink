import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bonuslink.example";
    return ["", "comment-ca-marche", "parrainage", "recompenses", "retraits", "faq", "a-propos", "contact", "conditions", "confidentialite"].map((path) => ({ url: `${base}/${path}`, lastModified: new Date() }));
}
