import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: "https://cinezone-hd.fr",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://cinezone-hd.fr/films",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://cinezone-hd.fr/sagas",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://cinezone-hd.fr/series",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://cinezone-hd.fr/actualites",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://cinezone-hd.fr/chat",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: "https://cinezone-hd.fr/contact",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://cinezone-hd.fr/demande-film",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://cinezone-hd.fr/favoris",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
