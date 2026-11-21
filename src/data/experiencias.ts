/**
 * Contenido de la página de Experiencias en español e inglés.
 * Fuentes: Informe institucional (sección 9) y Plan del sitio.
 * Las fotos se asignan por clave en ExperiencesPage.astro.
 */
import type { Lang } from '../i18n/ui';

export type ExperiencePhoto = 'panorama' | 'cascada' | 'hongo' | 'amonitas' | null;

export interface ExperiencesContent {
	meta: { title: string; description: string };
	hero: { eyebrow: string; titleA: string; titleB: string; alt: string };
	notice: string;
	listLabel: string;
	photoPending: string;
	ask: string;
	askMessage: string;
	items: { photo: ExperiencePhoto; title: string; text: string; facts?: string; alt?: string }[];
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
		notice: 'Todas las experiencias están sujetas al clima, a la dificultad del recorrido, a la disponibilidad de guías y a reserva previa.',
		listLabel: 'Lista de experiencias',
		photoPending: 'Foto pendiente',
		ask: 'Consultar por WhatsApp',
		askMessage: 'Hola, quisiera información sobre:',
		items: [
			{
				photo: 'panorama',
				title: 'Caminata al bosque nebuloso',
				text: 'Una travesía de dos días hacia el bosque nebuloso, con guía.',
				facts: '2 días · ascenso de 7 h',
				alt: 'Vista panorámica del valle y las montañas desde la terraza',
			},
			{ photo: null, title: 'Rapel en cascada', text: 'Descenso con cuerda junto a la caída de agua.' },
			{
				photo: 'cascada',
				title: 'Cascada El Limo',
				text: 'Una caminata interpretativa por el bosque hasta la cascada: paisaje, vegetación y la importancia de los bosques que protegen el agua.',
				alt: 'Grupo de visitantes en la poza al pie de la Cascada El Limo',
			},
			{ photo: null, title: 'Observación de aves', text: 'Recorridos para observar y escuchar las aves que viven en el bosque.' },
			{
				photo: 'hongo',
				title: 'Baños de bosque',
				text: 'Caminar despacio, mirar de cerca: hongos, musgos, insectos y silencio.',
				alt: 'Pequeño hongo rojo entre hojas secas del bosque',
			},
			{
				photo: 'amonitas',
				title: 'Museo Geológico y Paleontológico',
				text: 'Fósiles de organismos marinos del Cretácico, como amonitas, rudistas, bivalvos y gasterópodos, que cuentan cómo esta montaña fue mar.',
				facts: 'Experiencia cercana',
				alt: 'Colección de amonitas fósiles pulidas sobre una mesa',
			},
		],
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
		notice: 'All experiences depend on weather, trail difficulty, guide availability and advance booking.',
		listLabel: 'List of experiences',
		photoPending: 'Photo to be supplied',
		ask: 'Ask on WhatsApp',
		askMessage: 'Hello, I would like information about:',
		items: [
			{
				photo: 'panorama',
				title: 'Cloud forest hike',
				text: 'A two-day trek into the cloud forest, with a guide.',
				facts: '2 days · 7 h ascent',
				alt: 'Panoramic view of the valley and mountains from the terrace',
			},
			{ photo: null, title: 'Waterfall rappelling', text: 'A rope descent beside the falling water.' },
			{
				photo: 'cascada',
				title: 'El Limo Waterfall',
				text: 'An interpretive walk through the forest to the waterfall: landscape, vegetation and why forests that protect water matter.',
				alt: 'Group of visitors in the pool at the foot of El Limo Waterfall',
			},
			{ photo: null, title: 'Birdwatching', text: 'Walks to watch and listen to the birds that live in the forest.' },
			{
				photo: 'hongo',
				title: 'Forest bathing',
				text: 'Walk slowly and look closely: fungi, moss, insects and silence.',
				alt: 'Small red mushroom among dry forest leaves',
			},
			{
				photo: 'amonitas',
				title: 'Geological and Paleontological Museum',
				text: 'Fossils of Cretaceous marine organisms, such as ammonites, rudists, bivalves and gastropods, that tell how this mountain was once sea.',
				facts: 'Nearby experience',
				alt: 'Collection of polished fossil ammonites on a table',
			},
		],
	},
};
