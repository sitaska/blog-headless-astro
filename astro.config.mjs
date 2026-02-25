// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import redirects from './src/redirects.mjs';

const site = process.env.PUBLIC_SITE_URL ?? 'https://blog.lascositasdesita.com';

// https://astro.build/config
export default defineConfig({
	site,
	output: 'static',
	integrations: [mdx(), sitemap()],
	redirects,
});
