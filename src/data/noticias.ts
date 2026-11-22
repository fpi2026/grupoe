/**
 * Etiquetas y textos fijos del módulo de Noticias (ES/EN).
 * Las noticias viven en src/content/noticias/{es,en}/<slug>.md y se editan desde /admin.
 */
import type { Lang } from '../i18n/ui';

/** Etiquetas permitidas (Plan del sitio: eventos, grupos, mejoras, conservación, y las del diseño). */
export const newsTags = {
	energia: { es: 'Energía', en: 'Energy' },
	reconocimientos: { es: 'Reconocimientos', en: 'Awards' },
	ciencia: { es: 'Ciencia', en: 'Science' },
	conservacion: { es: 'Conservación', en: 'Conservation' },
	educacion: { es: 'Educación', en: 'Education' },
	eventos: { es: 'Eventos', en: 'Events' },
	grupos: { es: 'Grupos', en: 'Groups' },
	mejoras: { es: 'Mejoras', en: 'Improvements' },
} as const satisfies Record<string, Record<Lang, string>>;

export type NewsTag = keyof typeof newsTags;
export const newsTagIds = Object.keys(newsTags) as [NewsTag, ...NewsTag[]];

export const noticiasUI = {
	es: {
		title: 'Noticias',
		description: 'Novedades de Cabañas Alpinas El Limo: reconocimientos, energía solar, ciencia y conservación en El Limo, Metapán.',
		filterLabel: 'Filtrar por etiqueta',
		all: 'Todas',
		empty: 'Todavía no hay noticias publicadas.',
		latest: 'Últimas noticias',
		allNews: 'Todas las noticias',
		back: 'Todas las noticias',
		published: 'Publicado el',
	},
	en: {
		title: 'News',
		description: 'News from Cabañas Alpinas El Limo: awards, solar energy, science and conservation in El Limo, Metapán.',
		filterLabel: 'Filter by tag',
		all: 'All',
		empty: 'No news has been published yet.',
		latest: 'Latest news',
		allNews: 'All news',
		back: 'All news',
		published: 'Published on',
	},
} as const satisfies Record<Lang, Record<string, string>>;

export function formatDate(date: Date, lang: Lang): string {
	return new Intl.DateTimeFormat(lang === 'es' ? 'es-SV' : 'en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}
