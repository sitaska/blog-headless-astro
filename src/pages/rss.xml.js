import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getEntityPath, getPosts, stripHtml } from '../lib/wp';

export async function GET(context) {
	const posts = await getPosts();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: stripHtml(post.title.rendered),
			description: stripHtml(post.excerpt.rendered),
			pubDate: new Date(post.date),
			link: `/${getEntityPath(post)}/`,
		})),
	});
}
