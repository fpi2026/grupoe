/**
 * Contenido de la página de Alojamiento en español e inglés.
 * Fuente: Informe institucional (sección 7) y Plan del sitio.
 * Descripción, tarifa, características y fotos de las cabañas, el hospedaje hermano y
 * «Antes de venir» están en src/content/datos/alojamiento.json (los edita el panel).
 */
import { contact, type Lang } from '../i18n/ui';

export interface StayContent {
	meta: { title: string; description: string };
	intro: { eyebrow: string; titleA: string; titleB: string; lead: string };
	cabins: { title: string; book: string };
	lodge: { eyebrow: string; title: string; photoPending: string };
	before: {
		title: string;
		/** Texto de cada enlace posible de «Antes de venir». */
		links: Record<'gastronomia' | 'experiencias' | 'contacto' | 'sostenibilidad', string>;
	};
	booking: { titleA: string; titleB: string; text: string };
}

export const alojamiento: Record<Lang, StayContent> = {
	es: {
		meta: {
			title: 'Alojamiento',
			description:
				'Dos cabañas alpinas tipo A para 5 personas y un hospedaje hermano para grupos y familias en El Limo, Metapán. Reserva por WhatsApp.',
		},
		intro: {
			eyebrow: 'Alojamiento',
			titleA: 'Madera, techo verde',
			titleB: 'y bosque alrededor',
			lead: 'Dos cabañas alpinas tipo A y un hospedaje hermano para grupos y familias. Todas las unidades se reservan por WhatsApp.',
		},
		cabins: {
			title: 'Cabañas Alpinas',
			book: 'Reservar esta cabaña',
		},
		lodge: {
			eyebrow: 'Para grupos y familias',
			title: 'Hospedaje hermano',
			photoPending: 'Foto del hospedaje hermano pendiente de recibir',
		},
		before: {
			title: 'Antes de venir',
			links: { gastronomia: 'Ver gastronomía', experiencias: 'Ver experiencias', contacto: 'Cómo llegar', sostenibilidad: 'Sostenibilidad y aire' },
		},
		booking: {
			titleA: 'Reserva',
			titleB: 'en un mensaje',
			text: `Elige unidad, fechas y personas. Se abre WhatsApp con tu solicitud lista para enviar al ${contact.whatsappDisplay}.`,
		},
	},
	en: {
		meta: {
			title: 'Stay',
			description:
				'Two A-frame alpine cabins for 5 guests and a sister lodge for groups and families in El Limo, Metapán. Book on WhatsApp.',
		},
		intro: {
			eyebrow: 'Stay',
			titleA: 'Wood, a green roof',
			titleB: 'and forest all around',
			lead: 'Two A-frame alpine cabins and a sister lodge for groups and families. All units are booked on WhatsApp.',
		},
		cabins: {
			title: 'Cabañas Alpinas',
			book: 'Book this cabin',
		},
		lodge: {
			eyebrow: 'For groups and families',
			title: 'Sister lodge',
			photoPending: 'Sister lodge photo to be supplied',
		},
		before: {
			title: 'Before you come',
			links: { gastronomia: 'See food', experiencias: 'See experiences', contacto: 'Getting here', sostenibilidad: 'Sustainability and air' },
		},
		booking: {
			titleA: 'Book',
			titleB: 'in one message',
			text: `Choose a unit, dates and guests. WhatsApp opens with your request ready to send to ${contact.whatsappDisplay}.`,
		},
	},
};
