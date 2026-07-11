import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/onboarding', '/auth/'],
    },
    sitemap: 'https://food-bridge-seven-delta.vercel.app/sitemap.xml',
  }
}
