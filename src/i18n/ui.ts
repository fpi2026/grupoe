/**
 * Diccionario y rutas del sitio en español e inglés.
 * Los textos salen del informe institucional y del diseño; no se inventan datos.
 */

export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

/** Páginas del sitio y su ruta en cada idioma (sin barra inicial; '' = inicio). */
export const routes = {
	inicio: { es: '', en: '' },
	alojamiento: { es: 'alojamiento', en: 'stay' },
	experiencias: { es: 'experiencias', en: 'experiences' },
	gastronomia: { es: 'gastronomia', en: 'food' },
	sostenibilidad: { es: 'sostenibilidad', en: 'sustainability' },
	noticias: { es: 'noticias', en: 'news' },
	galeria: { es: 'galeria', en: 'gallery' },
	contacto: { es: 'contacto', en: 'getting-here' },
} as const satisfies Record<string, Record<Lang, string>>;
export type RouteKey = keyof typeof routes;

/** Orden de la navegación principal. */
export const navOrder: RouteKey[] = [
	'inicio',
	'alojamiento',
	'experiencias',
	'gastronomia',
	'sostenibilidad',
	'noticias',
	'galeria',
	'contacto',
];

/** Datos de contacto (Informe institucional). */
export const contact = {
	whatsapp: '50375683400',
	whatsappDisplay: '+503 7568-3400',
	/** Historial de la estación del hostal en AireSV (Plan del sitio). */
	airesvHistory: 'https://airesv.esaapp.com/historial/METAPANLIMOHOSTAL',
} as const;

export const ui = {
	es: {
		'site.name': 'Cabañas Alpinas El Limo',
		'site.tagline': 'Despierta en las montañas, vive la serenidad.',
		'site.description':
			'Cabañas tipo A en el Cantón El Limo, Metapán, en la zona de amortiguamiento de la Reserva de la Biosfera Trifinio Fraternidad.',

		'nav.inicio': 'Inicio',
		'nav.alojamiento': 'Alojamiento',
		'nav.experiencias': 'Experiencias',
		'nav.gastronomia': 'Gastronomía',
		'nav.sostenibilidad': 'Sostenibilidad y aire',
		'nav.noticias': 'Noticias',
		'nav.galeria': 'Galería',
		'nav.contacto': 'Cómo llegar',
		'nav.label': 'Principal',

		'header.skip': 'Saltar al contenido',
		'header.home': 'Cabañas Alpinas El Limo, inicio',
		'header.brand': 'CABAÑAS ALPINAS',
		'header.brandSub': 'hospedaje · alimentación · bienestar',
		'header.langGroup': 'Idioma / Language',
		'header.theme': 'Cambiar entre tema día y noche',
		'header.themeTitle': 'Día / Noche',
		'header.book': 'Reservar',

		'whatsapp.message': 'Hola, quisiera información sobre Cabañas Alpinas El Limo.',
		'whatsapp.label': `Escribir por WhatsApp al ${contact.whatsappDisplay}`,

		'footer.where': 'Dónde estamos',
		'footer.address1': 'Cantón El Limo, Metapán',
		'footer.address2': 'Santa Ana Norte, El Salvador',
		'footer.buffer': 'Zona de amortiguamiento, Reserva de la Biosfera Trifinio Fraternidad',
		'footer.contact': 'Contacto',
		'footer.hours': 'Atención de 7 a.m. a 7 p.m.',
		'footer.credentials': 'Credenciales',
		'footer.seal': 'Sello Ambiental NTS 13.11.14:25',
		'footer.registry': 'Registro Nacional de Turismo: en trámite',
		'footer.air': 'Calidad del aire (UES · AireSV)',
		'footer.academic': 'Propuesta académica – UES-FMOcc',
	},
	en: {
		'site.name': 'Cabañas Alpinas El Limo',
		'site.tagline': 'Wake up in the mountains, live the serenity.',
		'site.description':
			'A-frame cabins in Cantón El Limo, Metapán, in the buffer zone of the Trifinio Fraternidad Biosphere Reserve.',

		'nav.inicio': 'Home',
		'nav.alojamiento': 'Stay',
		'nav.experiencias': 'Experiences',
		'nav.gastronomia': 'Food',
		'nav.sostenibilidad': 'Sustainability & air',
		'nav.noticias': 'News',
		'nav.galeria': 'Gallery',
		'nav.contacto': 'Getting here',
		'nav.label': 'Main',

		'header.skip': 'Skip to content',
		'header.home': 'Cabañas Alpinas El Limo, home',
		'header.brand': 'CABAÑAS ALPINAS',
		'header.brandSub': 'hospedaje · alimentación · bienestar',
		'header.langGroup': 'Idioma / Language',
		'header.theme': 'Switch between day and night theme',
		'header.themeTitle': 'Day / Night',
		'header.book': 'Book',

		'whatsapp.message': 'Hello, I would like information about Cabañas Alpinas El Limo.',
		'whatsapp.label': `Message us on WhatsApp at ${contact.whatsappDisplay}`,

		'footer.where': 'Where we are',
		'footer.address1': 'Cantón El Limo, Metapán',
		'footer.address2': 'Santa Ana Norte, El Salvador',
		'footer.buffer': 'Buffer zone, Trifinio Fraternidad Biosphere Reserve',
		'footer.contact': 'Contact',
		'footer.hours': 'Open 7 a.m. to 7 p.m.',
		'footer.credentials': 'Credentials',
		'footer.seal': 'Environmental Seal NTS 13.11.14:25',
		'footer.registry': 'National Tourism Registry: in process',
		'footer.air': 'Air quality (UES · AireSV)',
		'footer.academic': 'Academic proposal – UES-FMOcc',
	},
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLang];
