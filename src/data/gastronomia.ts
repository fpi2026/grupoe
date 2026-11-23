/**
 * Contenido de la página de Gastronomía en español e inglés.
 * Fuentes: Informe institucional (sección 8) y Plan del sitio.
 */
import type { Lang } from '../i18n/ui';

/** La nota, los platillos y las fotos están en src/content/datos/menu.json (los edita el panel). */
export interface FoodContent {
	meta: { title: string; description: string };
	intro: { eyebrow: string; titleA: string; titleB: string; lead: string; alt: string };
	menu: { title: string };
	photosLabel: string;
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
			alt: 'Desayuno típico: frijoles, huevos picados, plátano frito, queso y crema sobre una mesa de madera',
		},
		menu: {
			title: 'Lo que servimos',
		},
		photosLabel: 'Fotografías',
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
			alt: 'Traditional breakfast: beans, scrambled eggs, fried plantain, cheese and cream on a wooden table',
		},
		menu: {
			title: 'What we serve',
		},
		photosLabel: 'Photographs',
		cta: {
			text: 'Coming as a group or want to book your meals? Message us on WhatsApp.',
			button: 'Reserve a meal',
			message: 'Hello, I would like to reserve meals at Cabañas Alpinas El Limo.',
		},
	},
};
