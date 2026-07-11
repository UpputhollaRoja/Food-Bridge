import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://food-bridge-seven-delta.vercel.app'
  return [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/signup`, lastModified: new Date(), priority: 0.5 },
  ]
}
