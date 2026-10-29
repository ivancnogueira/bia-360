import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: [
          'ChatGPT-User',
          'GPTBot',
          'Google-Extended',
          'ClaudeBot',
          'PerplexityBot',
          'Applebot',
        ],
        allow: '/',
      },
    ],
    sitemap: 'https://ivancnogueira.github.io/bia-360/vendas/sitemap.xml',
  };
}
