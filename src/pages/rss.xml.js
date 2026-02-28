import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getEntityPath, getFeaturedMediaMap, getPosts, stripHtml } from '../lib/wp';

function getImageMimeType(url) {
	const normalized = url.toLowerCase();
	if (normalized.endsWith('.png')) return 'image/png';
	if (normalized.endsWith('.webp')) return 'image/webp';
	if (normalized.endsWith('.gif')) return 'image/gif';
	if (normalized.endsWith('.svg')) return 'image/svg+xml';
	if (normalized.endsWith('.avif')) return 'image/avif';
	return 'image/jpeg';
}

export async function GET(context) {
	const posts = await getPosts();
	const mediaMap = await getFeaturedMediaMap(posts.map((post) => post.featured_media));
	const siteUrl = new URL('/', context.site).toString();
	const feedImageUrl = new URL('/favicon.png', context.site).toString();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: {
			media: 'http://search.yahoo.com/mrss/',
		},
		customData: `<image><url>${feedImageUrl}</url><title>${SITE_TITLE}</title><link>${siteUrl}</link></image>`,
		items: posts.map((post) => {
			const featuredImage = mediaMap.get(post.featured_media)?.source_url;
			const description = stripHtml(post.excerpt.rendered);
			const item = {
				title: stripHtml(post.title.rendered),
				description,
				pubDate: new Date(post.date),
				link: `/${getEntityPath(post)}/`,
			};

			if (!featuredImage) {
				return item;
			}

			const mimeType = getImageMimeType(featuredImage);
			return {
				...item,
				enclosure: {
					url: featuredImage,
					type: mimeType,
					length: 0,
				},
				customData: `<media:content url="${featuredImage}" medium="image" type="${mimeType}" /><media:thumbnail url="${featuredImage}" />`,
			};
		}),
	});
}
