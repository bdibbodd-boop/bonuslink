import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest { return { name: "BonusLink", short_name: "BonusLink", description: "Plateforme de récompenses et de parrainage", start_url: "/", display: "standalone", background_color: "#f4f1e8", theme_color: "#17211b" }; }
