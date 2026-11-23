/**
 * Contenido de la página de Experiencias en español e inglés.
 * Fuentes: Informe institucional (sección 9) y Plan del sitio.
 * El aviso y la lista de experiencias están en src/content/datos/experiencias.json (los edita el panel).
 */
import type { Lang } from '../i18n/ui';

export interface ExperiencesContent {
	meta: { title: string; description: string };
	hero: { eyebrow: string; titleA: string; titleB: string; alt: string };
	listLabel: string;
	photoPending: string;
	ask: string;
	askMessage: string;
	/** Nombre de cada dificultad. */
	difficulty: Record<'baja' | 'media' | 'alta', string>;
}

export const experiencias: Record<Lang, ExperiencesContent> = {
	es: {
		meta: {
			title: 'Experiencias',
			description:
				'Caminata al bosque nebuloso, rapel en cascada, Cascada El Limo, observación de aves, baños de bosque y el Museo Geológico y Paleontológico, en El Limo, Metapán.',
		},
		hero: {
			eyebrow: 'Experiencias',
			titleA: 'Caminar, mojarse',
			titleB: 'y escuchar el bosque',
			alt: 'Montañas cubiertas de bosque con un rayo de sol',
		},
		listLabel: 'Lista de experiencias',
		photoPending: 'Foto pendiente',
		ask: 'Consultar por WhatsApp',
		askMessage: 'Hola, quisiera información sobre:',
		difficulty: { baja: 'Dificultad baja', media: 'Dificultad media', alta: 'Dificultad alta' },
	},
	en: {
		meta: {
			title: 'Experiences',
			description:
				'Cloud forest hike, waterfall rappelling, El Limo Waterfall, birdwatching, forest bathing and the Geological and Paleontological Museum, in El Limo, Metapán.',
		},
		hero: {
			eyebrow: 'Experiences',
			titleA: 'Walk, get wet',
			titleB: 'and listen to the forest',
			alt: 'Forest-covered mountains with a ray of sunlight',
		},
		listLabel: 'List of experiences',
		photoPending: 'Photo to be supplied',
		ask: 'Ask on WhatsApp',
		askMessage: 'Hello, I would like information about:',
		difficulty: { baja: 'Easy', media: 'Moderate', alta: 'Challenging' },
	},
};
