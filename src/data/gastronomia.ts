/**
 * Contenido de la página de Gastronomía en español e inglés.
 * Fuentes: Informe institucional (sección 8) y Plan del sitio.
 */
import type { Lang } from '../i18n/ui';

export interface FoodContent {
	meta: { title: string; description: string };
	intro: { eyebrow: string; titleA: string; titleB: string; lead: string; note: string; alt: string };
	menu: { title: string; items: { title: string; text: string }[] };
	photosLabel: string;
	photos: string[];
	cta: { text: string; button: string; message: string };
}

export const gastronomia: Record<Lang, FoodContent> = {
	es: {
		meta: {
			title: 'Gastronomía',
			description:
				'De la granja a tu mesa: desayunos típicos salvadoreños, gallina india de la granja, tilapia y lácteos, con reservación, en El Limo, Metapán.',
		},
		intro: {
			eyebrow: 'Gastronomía',
			titleA: 'De la granja',
			titleB: 'a tu mesa',
			lead: 'Cocina rural salvadoreña con recetas tradicionales y productos locales.',
			note: 'Todas las comidas son con reservación.',
			alt: 'Desayuno típico: frijoles, huevos picados, plátano frito, queso y crema sobre una mesa de madera',
		},
		menu: {
			title: 'Lo que servimos',
			items: [
				{ title: 'Desayunos típicos', text: 'Desayunos salvadoreños: frijoles, huevos, plátano frito, queso y crema.' },
				{ title: 'Gallina india', text: 'Gallina india de la granja.' },
				{ title: 'Tilapia', text: 'Tilapia, entre otras preparaciones tradicionales.' },
				{ title: 'Lácteos', text: 'Queso, crema y otros lácteos de la zona.' },
			],
		},
		photosLabel: 'Fotografías',
		photos: [
			'Plato de frijoles, plátano frito, huevos y queso con el bosque al fondo',
			'Terraza de noche iluminada con guirnaldas de luces cálidas',
			'Estantes de ladrillo con botellas artesanales y cristalería',
		],
		cta: {
			text: '¿Vienes en grupo o quieres reservar tus comidas? Escríbenos por WhatsApp.',
			button: 'Reservar comida',
			message: 'Hola, quisiera reservar comida en Cabañas Alpinas El Limo.',
		},
	},
	en: {
		meta: {
			title: 'Food',
			description:
				'Farm to table: traditional Salvadoran breakfasts, free-range hen from the farm, tilapia and dairy, by reservation, in El Limo, Metapán.',
		},
		intro: {
			eyebrow: 'Food',
			titleA: 'From the farm',
			titleB: 'to your table',
			lead: 'Rural Salvadoran cooking with traditional recipes and local produce.',
			note: 'All meals are by reservation.',
			alt: 'Traditional breakfast: beans, scrambled eggs, fried plantain, cheese and cream on a wooden table',
		},
		menu: {
			title: 'What we serve',
			items: [
				{ title: 'Traditional breakfasts', text: 'Salvadoran breakfasts: beans, eggs, fried plantain, cheese and cream.' },
				{ title: 'Free-range hen', text: 'Free-range hen from the farm.' },
				{ title: 'Tilapia', text: 'Tilapia, among other traditional dishes.' },
				{ title: 'Dairy', text: 'Cheese, cream and other local dairy.' },
			],
		},
		photosLabel: 'Photographs',
		photos: [
			'Plate of beans, fried plantain, eggs and cheese with the forest in the background',
			'Terrace at night lit with warm string lights',
			'Brick shelves with craft bottles and glassware',
		],
		cta: {
			text: 'Coming as a group or want to book your meals? Message us on WhatsApp.',
			button: 'Reserve a meal',
			message: 'Hello, I would like to reserve meals at Cabañas Alpinas El Limo.',
		},
	},
};
