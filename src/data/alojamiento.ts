/**
 * Contenido de la página de Alojamiento en español e inglés.
 * Fuente: Informe institucional (sección 7) y Plan del sitio.
 */
import type { Lang } from '../i18n/ui';

export interface StayContent {
	meta: { title: string; description: string };
	intro: { eyebrow: string; titleA: string; titleB: string; lead: string };
	cabins: {
		title: string;
		text: string;
		rate: string;
		rateNote: string;
		book: string;
		photos: string[];
		specs: { k: string; v: string }[];
	};
	lodge: {
		eyebrow: string;
		title: string;
		photoPending: string;
		units: { name: string; text: string }[];
		rates: string;
	};
	before: {
		title: string;
		items: { title: string; text: string; link?: string }[];
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
			text: 'Dos cabañas tipo A, cada una para 5 personas, con balcón de madera y rodeadas de naturaleza.',
			rate: '$120',
			rateNote: 'por 24 h · tarifa referencial',
			book: 'Reservar esta cabaña',
			photos: [
				'Cabaña alpina tipo A iluminada de noche, con balcón de madera',
				'Las dos cabañas alpinas frente a un jardín amplio',
				'Pan dulce artesanal con una cabaña alpina al fondo',
			],
			specs: [
				{ k: 'Capacidad', v: '5 personas' },
				{ k: 'Camas', v: '4 camas' },
				{ k: 'Cocina', v: 'Con refrigeradora' },
				{ k: 'Baño', v: 'Privado' },
				{ k: 'Unidades', v: '2 cabañas tipo A' },
				{ k: 'Acceso Amaris', v: 'Sedán y microbús' },
			],
		},
		lodge: {
			eyebrow: 'Para grupos y familias',
			title: 'Hospedaje hermano',
			photoPending: 'Foto del hospedaje hermano pendiente de recibir',
			units: [
				{ name: '4 habitaciones dobles', text: 'Para dos personas cada una, con baño privado.' },
				{ name: 'Cabaña familiar', text: '4 habitaciones y 10 camas.' },
			],
			rates: 'Tarifas por consulta en WhatsApp.',
		},
		before: {
			title: 'Antes de venir',
			items: [
				{ title: 'Acceso', text: 'Algunos tramos requieren 4x4 según la unidad. Amaris tiene acceso para sedán y microbús.' },
				{ title: 'Horario de atención', text: 'De 7 a.m. a 7 p.m.' },
				{ title: 'Comidas', text: 'Desayunos y platos típicos con reservación.', link: 'Ver gastronomía' },
			],
		},
		booking: {
			titleA: 'Reserva',
			titleB: 'en un mensaje',
			text: 'Elige unidad, fechas y personas. Se abre WhatsApp con tu solicitud lista para enviar al +503 7568-3400.',
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
			text: 'Two A-frame cabins, each for 5 guests, with a wooden balcony and surrounded by nature.',
			rate: '$120',
			rateNote: 'per 24 h · reference rate',
			book: 'Book this cabin',
			photos: [
				'A-frame alpine cabin lit at night, with a wooden balcony',
				'The two alpine cabins facing a wide garden',
				'Homemade sweet bread with an alpine cabin in the background',
			],
			specs: [
				{ k: 'Capacity', v: '5 guests' },
				{ k: 'Beds', v: '4 beds' },
				{ k: 'Kitchen', v: 'With fridge' },
				{ k: 'Bathroom', v: 'Private' },
				{ k: 'Units', v: '2 A-frame cabins' },
				{ k: 'Amaris access', v: 'Sedan and minibus' },
			],
		},
		lodge: {
			eyebrow: 'For groups and families',
			title: 'Sister lodge',
			photoPending: 'Sister lodge photo to be supplied',
			units: [
				{ name: '4 double rooms', text: 'For two guests each, with a private bath.' },
				{ name: 'Family cabin', text: '4 rooms and 10 beds.' },
			],
			rates: 'Rates on request via WhatsApp.',
		},
		before: {
			title: 'Before you come',
			items: [
				{ title: 'Access', text: 'Some stretches require 4x4 depending on the unit. Amaris has access for sedans and minibuses.' },
				{ title: 'Office hours', text: '7 a.m. to 7 p.m.' },
				{ title: 'Meals', text: 'Breakfasts and traditional dishes by reservation.', link: 'See food' },
			],
		},
		booking: {
			titleA: 'Book',
			titleB: 'in one message',
			text: 'Choose a unit, dates and guests. WhatsApp opens with your request ready to send to +503 7568-3400.',
		},
	},
};
