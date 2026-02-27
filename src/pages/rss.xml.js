import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getEntityPath, getPosts, stripHtml } from '../lib/wp';

const FEED_IMAGE_URL =
	'https://cms.lascositasdesita.com/wp-content/uploads/2026/01/cropped-sita-logo-circle.png';

export async function GET(context) {
	const posts = await getPosts();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		customData: `<image><url>${FEED_IMAGE_URL}</url><title>${SITE_TITLE}</title><link>${context.site}</link></image>`,
		items: posts.map((post) => ({
			title: stripHtml(post.title.rendered),
			description: stripHtml(post.excerpt.rendered),
			pubDate: new Date(post.date),
			link: `/${getEntityPath(post)}/`,
		})),
	});
}
