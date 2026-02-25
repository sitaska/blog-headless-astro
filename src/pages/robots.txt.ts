import type { APIContext } from 'astro';

export function GET({ site }: APIContext) {
	const siteUrl = site?.toString().replace(/\/$/, '') ?? 'https://blog.lascositasdesita.com';
	const body = [`User-agent: *`, `Allow: /`, `Sitemap: ${siteUrl}/sitemap-index.xml`].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}
