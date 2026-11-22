/**
 * Contenido de la página Cómo llegar y contacto en español e inglés.
 * Fuentes: Informe institucional (secciones 7 y 12) y Plan del sitio (horario).
 */
import type { Lang } from '../i18n/ui';

export interface ContactContent {
	meta: { title: string; description: string };
	intro: { eyebrow: string; titleA: string; titleB: string };
	facts: { k: string; v: string }[];
	access: string;
	mapsLink: string;
	photo: { label: string; alt: string; caption: string };
	form: {
		title: string;
		lead: string;
		name: string;
		email: string;
		message: string;
		error: string;
		submit: string;
		noJs: string;
		thanks: string;
		sent: string;
		again: string;
		/** Mensaje de WhatsApp: {name}, {email} y {msg} se reemplazan. */
		hello: string;
		helloEmail: string;
	};
}

export const contacto: Record<Lang, ContactContent> = {
	es: {
		meta: {
			title: 'Cómo llegar y contacto',
			description:
				'Cabañas Alpinas El Limo está en el cantón El Limo, Metapán, Santa Ana Norte, a unas 3 h 30 min de San Salvador. Ruta, acceso y contacto por WhatsApp.',
		},
		intro: { eyebrow: 'Cómo llegar', titleA: 'Subir hasta', titleB: 'El Limo' },
		facts: [
			{ k: 'Dirección', v: 'Cantón El Limo, distrito de Metapán, Santa Ana Norte, El Salvador' },
			{ k: 'Desde San Salvador', v: 'Aproximadamente 3 h 30 min, según la ruta y el estado del camino' },
			{ k: 'Horario', v: '7 a.m. a 7 p.m.' },
		],
		access:
			'Algunas instalaciones tienen acceso para vehículos convencionales; otras experiencias del Parque Geoturístico requieren 4x4 o caminata en el último tramo. La cabaña Amaris tiene un acceso más sencillo para sedán y microbús. Te enviamos por WhatsApp las instrucciones según la unidad que reserves.',
		mapsLink: 'Abrir en Google Maps',
		photo: {
			label: 'Fotografía del lugar',
			alt: 'Sendero con paneles informativos junto al bosque',
			caption: 'Sendero con paneles informativos junto al bosque.',
		},
		form: {
			title: 'Escríbenos',
			lead: 'Para grupos, universidades o preguntas sobre la ruta. Respondemos de 7 a.m. a 7 p.m.',
			name: 'Nombre',
			email: 'Correo (opcional)',
			message: 'Mensaje',
			error: 'Escribe tu nombre y un mensaje.',
			submit: 'Enviar por WhatsApp',
			noJs: 'Para enviar el formulario se necesita JavaScript. También puedes escribirnos directamente por WhatsApp:',
			thanks: 'Gracias, {name}.',
			sent: 'Abrimos WhatsApp con tu mensaje. Si no se abrió, escríbenos al {phone}.',
			again: 'Enviar otro mensaje',
			hello: 'Hola, soy {name}.\n{msg}',
			helloEmail: 'Hola, soy {name} ({email}).\n{msg}',
		},
	},
	en: {
		meta: {
			title: 'Getting here and contact',
			description:
				'Cabañas Alpinas El Limo is in El Limo, Metapán, Santa Ana Norte, about 3 h 30 min from San Salvador. Route, access and contact on WhatsApp.',
		},
		intro: { eyebrow: 'Getting here', titleA: 'Up to', titleB: 'El Limo' },
		facts: [
			{ k: 'Address', v: 'Cantón El Limo, Metapán district, Santa Ana Norte, El Salvador' },
			{ k: 'From San Salvador', v: 'About 3 h 30 min, depending on the route and road conditions' },
			{ k: 'Hours', v: '7 a.m. to 7 p.m.' },
		],
		access:
			'Some facilities can be reached by regular car; other Geotourism Park experiences need a 4x4 or a walk on the last stretch. The Amaris cabin has easier access for sedans and minibuses. We send you directions on WhatsApp for the unit you book.',
		mapsLink: 'Open in Google Maps',
		photo: {
			label: 'Photo of the place',
			alt: 'Trail with information panels beside the forest',
			caption: 'Trail with information panels beside the forest.',
		},
		form: {
			title: 'Write to us',
			lead: 'For groups, universities or route questions. We reply 7 a.m. to 7 p.m.',
			name: 'Name',
			email: 'Email (optional)',
			message: 'Message',
			error: 'Please add your name and a message.',
			submit: 'Send via WhatsApp',
			noJs: 'The form needs JavaScript. You can also write to us directly on WhatsApp:',
			thanks: 'Thank you, {name}.',
			sent: "We opened WhatsApp with your message. If it didn't open, write to {phone}.",
			again: 'Send another message',
			hello: "Hi, I'm {name}.\n{msg}",
			helloEmail: "Hi, I'm {name} ({email}).\n{msg}",
		},
	},
};
