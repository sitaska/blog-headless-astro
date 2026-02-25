export type WPRendered = {
	rendered: string;
};

export type WPPost = {
	id: number;
	date: string;
	modified: string;
	slug: string;
	link: string;
	title: WPRendered;
	excerpt: WPRendered;
	content: WPRendered;
	featured_media: number;
	categories: number[];
};

export type WPPage = {
	id: number;
	date: string;
	modified: string;
	slug: string;
	link: string;
	title: WPRendered;
	excerpt: WPRendered;
	content: WPRendered;
	featured_media: number;
};

export type WPCategory = {
	id: number;
	name: string;
	slug: string;
	count: number;
};

export type WPMedia = {
	id: number;
	source_url: string;
	alt_text: string;
};

export type WPEntity = WPPost | WPPage;

const DEFAULT_API_BASE = 'https://cms.lascositasdesita.com/wp-json/wp/v2';
const WP_API_BASE = (import.meta.env.WP_API_BASE ?? import.meta.env.PUBLIC_WP_API_BASE ?? DEFAULT_API_BASE).replace(
	/\/$/,
	'',
);

function buildUrl(path: string, params?: Record<string, string | number>) {
	const url = new URL(`${WP_API_BASE}/${path.replace(/^\//, '')}`);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, String(value));
		}
	}
	return url;
}

async function fetchJson<T>(path: string, params?: Record<string, string | number>): Promise<T> {
	const url = buildUrl(path, params);
	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`WordPress API error (${response.status}) at ${url.toString()}`);
	}

	return (await response.json()) as T;
}

async function fetchPaginated<T>(path: string) {
	const first = await fetch(buildUrl(path, { per_page: 100, page: 1 }), {
		headers: { Accept: 'application/json' },
	});

	if (!first.ok) {
		throw new Error(`WordPress API error (${first.status}) while fetching ${path}`);
	}

	const firstData = (await first.json()) as T[];
	const totalPages = Number(first.headers.get('x-wp-totalpages') ?? 1);

	if (totalPages <= 1) {
		return firstData;
	}

	const remaining = await Promise.all(
		Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
			fetchJson<T[]>(path, { per_page: 100, page }),
		),
	);

	return firstData.concat(...remaining);
}

export async function getPosts() {
	try {
		const posts = await fetchPaginated<WPPost>('posts');
		return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
	} catch (error) {
		console.warn('[wp] Could not fetch posts:', error);
		return [] as WPPost[];
	}
}

export async function getPages() {
	try {
		return await fetchPaginated<WPPage>('pages');
	} catch (error) {
		console.warn('[wp] Could not fetch pages:', error);
		return [] as WPPage[];
	}
}

export async function getCategories() {
	try {
		return await fetchPaginated<WPCategory>('categories');
	} catch (error) {
		console.warn('[wp] Could not fetch categories:', error);
		return [] as WPCategory[];
	}
}

export async function getFeaturedMediaMap(mediaIds: number[]) {
	const uniqueIds = Array.from(new Set(mediaIds.filter(Boolean)));
	if (uniqueIds.length === 0) {
		return new Map<number, WPMedia>();
	}

	const mediaEntries = await Promise.all(
		uniqueIds.map(async (id) => {
			try {
				const media = await fetchJson<WPMedia>(`media/${id}`);
				return [id, media] as const;
			} catch {
				return [id, undefined] as const;
			}
		}),
	);

	const map = new Map<number, WPMedia>();
	for (const [id, media] of mediaEntries) {
		if (media) {
			map.set(id, media);
		}
	}

	return map;
}

export function getEntityPath(entity: WPEntity) {
	try {
		const pathname = new URL(entity.link).pathname;
		return pathname.replace(/^\/+|\/+$/g, '');
	} catch {
		return entity.slug;
	}
}

export function stripHtml(value: string) {
	return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
