/** Consultas a la colección de noticias. */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { localizedPath } from '../i18n/utils';

export type NewsEntry = CollectionEntry<'noticias'>;

/** Idioma y slug a partir del id ('es/sistema-solar'). */
export function parseId(id: string): { lang: Lang; slug: string } {
	const [lang, slug] = id.split('/') as [Lang, string];
	return { lang, slug };
}

/** Noticias publicadas de un idioma, de la más reciente a la más antigua. */
export async function getNews(lang: Lang): Promise<NewsEntry[]> {
	const all = await getCollection('noticias', (n) => n.data.publicado && parseId(n.id).lang === lang);
	return all.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime() || b.id.localeCompare(a.id));
}

/** Enlace al detalle de una noticia. */
export function newsPath(lang: Lang, slug: string): string {
	return localizedPath('noticias', lang, '').replace(/\/?$/, `/${slug}/`);
}
