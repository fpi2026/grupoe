/**
 * Categorías y textos fijos de la Galería. Las fotos (archivo, categoría y descripción ES/EN)
 * están en src/content/datos/galeria.json: las edita el panel y se validan en src/data/editable.ts.
 */
import type { Lang } from '../i18n/ui';

export const categories = [
	{ id: 'all', es: 'Todo', en: 'All' },
	{ id: 'cabanas', es: 'Cabañas', en: 'Cabins' },
	{ id: 'naturaleza', es: 'Naturaleza', en: 'Nature' },
	{ id: 'fosiles', es: 'Fósiles', en: 'Fossils' },
	{ id: 'gastronomia', es: 'Gastronomía', en: 'Food' },
	{ id: 'comunidad', es: 'Comunidad', en: 'Community' },
	{ id: 'sostenibilidad', es: 'Sostenibilidad', en: 'Sustainability' },
] as const;
export type CategoryId = Exclude<(typeof categories)[number]['id'], 'all'>;
/** Categorías que puede tener una foto (sin «Todo»). */
export const categoryIds = categories.filter((c) => c.id !== 'all').map((c) => c.id) as [CategoryId, ...CategoryId[]];


export const galeriaText: Record<
	Lang,
	{ title: string; description: string; filter: string; enlarge: string; viewer: string; close: string; prev: string; next: string }
> = {
	es: {
		title: 'Galería',
		description: 'Fotos de las cabañas, el bosque, los fósiles, la gastronomía y la comunidad de Cabañas Alpinas El Limo.',
		filter: 'Filtrar por categoría',
		enlarge: 'Ampliar:',
		viewer: 'Visor de imágenes',
		close: 'Cerrar visor',
		prev: 'Imagen anterior',
		next: 'Imagen siguiente',
	},
	en: {
		title: 'Gallery',
		description: 'Photos of the cabins, the forest, the fossils, the food and the community at Cabañas Alpinas El Limo.',
		filter: 'Filter by category',
		enlarge: 'Enlarge:',
		viewer: 'Image viewer',
		close: 'Close viewer',
		prev: 'Previous image',
		next: 'Next image',
	},
};
