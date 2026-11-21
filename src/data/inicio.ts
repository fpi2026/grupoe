/**
 * Contenido de la página de Inicio en español e inglés.
 * Fuentes: Informe institucional, Plan del sitio y Propuesta pedagógica
 * (carpeta del proyecto). No se agregan cifras ni datos que no estén ahí.
 */
import type { Lang } from '../i18n/ui';

export interface HomeContent {
	meta: { title: string; description: string };
	hero: {
		eyebrow: string;
		titleA: string;
		titleB: string;
		lead: string;
		book: string;
		cabins: string;
		dayNight: string;
		day: string;
		night: string;
		altDay: string;
		altNight: string;
	};
	attrs: {
		title: string;
		lead: string;
		items: { title: string; text: string }[];
	};
	counters: {
		label: string;
		items: { value: number; decimals: number; suffix: string; unit: string; label: string }[];
	};
	cabins: {
		title: string;
		all: string;
		items: { eyebrow: string; name: string; text: string; rate: string; alt: string }[];
	};
	awards: {
		title: string;
		alt: string;
		items: { name: string; by: string }[];
	};
	booking: {
		titleA: string;
		titleB: string;
		hours: string;
		hoursValue: string;
		from: string;
		fromValue: string;
		location: string;
		locationValue: string;
		note: string;
	};
	air: {
		eyebrow: string;
		title: string;
		text: string;
		more: string;
	};
}

export const inicio: Record<Lang, HomeContent> = {
	es: {
		meta: {
			title: 'Cabañas Alpinas El Limo · Metapán',
			description:
				'Cabañas tipo A rodeadas de bosque nebuloso en El Limo, Metapán, en la zona de amortiguamiento de la Reserva de la Biosfera Trifinio Fraternidad.',
		},
		hero: {
			eyebrow: 'Reserva de la Biosfera Trifinio Fraternidad · El Limo, Metapán',
			titleA: 'Despierta en las montañas,',
			titleB: 'vive la serenidad.',
			lead: 'Cabañas tipo A rodeadas de bosque nebuloso, en la primera reserva trinacional de América. Niebla, madera, silencio y café de mañana.',
			book: 'Reservar por WhatsApp',
			cabins: 'Ver las cabañas',
			dayNight: 'Día o noche',
			day: 'Día',
			night: 'Noche',
			altDay: 'Dos cabañas tipo A de techo verde junto a un jardín, bajo cielo azul',
			altNight: 'Cabaña tipo A iluminada por dentro en la noche, rodeada de árboles',
		},
		attrs: {
			title: 'Seis razones para quedarte en El Limo',
			lead: 'Un hospedaje rural con ciencia real detrás: monitoreo del aire, fósiles marinos, energía solar y un bosque que se cuida todos los días.',
			items: [
				{
					title: 'Dormir en una reserva de biosfera',
					text: 'En la zona de amortiguamiento de la Trifinio Fraternidad, la primera reserva trinacional de América.',
				},
				{
					title: 'Viaje al pasado marino',
					text: 'Calizas del Cretácico con amonitas y rudistas: esta montaña fue un mar cálido.',
				},
				{
					title: 'Sostenibilidad demostrable',
					text: '5.85 kWp de energía solar y Sello Ambiental NTS 13.11.14:25.',
				},
				{
					title: 'Ciencia y monitoreo ambiental',
					text: 'Estación de calidad del aire con la Universidad de El Salvador y AireSV.',
				},
				{
					title: 'Protección de la biodiversidad',
					text: 'Más de 100 manzanas de bosque. Parte de la Mesa de Protección de Felinos: protegemos su hábitat.',
				},
				{
					title: 'Hospitalidad rural y gastronomía auténtica',
					text: 'De la granja a tu mesa: desayunos típicos, gallina india, tilapia y lácteos.',
				},
			],
		},
		counters: {
			label: 'En cifras',
			items: [
				{ value: 100, decimals: 0, suffix: '+', unit: '', label: 'manzanas de bosque protegidas' },
				{ value: 5.85, decimals: 2, suffix: '', unit: 'kWp', label: 'de energía solar instalada' },
				{ value: 3, decimals: 0, suffix: '', unit: '', label: 'países comparten la reserva' },
				{ value: 2, decimals: 0, suffix: '', unit: '', label: 'cabañas alpinas tipo A' },
			],
		},
		cabins: {
			title: 'Dónde dormir',
			all: 'Todo el alojamiento',
			items: [
				{
					eyebrow: '2 cabañas tipo A',
					name: 'Cabañas Alpinas',
					text: 'Para 5 personas · 4 camas · cocina · refrigeradora · baño privado. Amaris con acceso para sedán y microbús.',
					rate: 'Tarifa referencial: $120 por 24 h',
					alt: 'Fachada de la cabaña alpina tipo A con balcón de madera, iluminada de noche',
				},
				{
					eyebrow: 'Para grupos y familias',
					name: 'Hospedaje hermano',
					text: '4 habitaciones dobles con baño privado y una cabaña familiar de 4 habitaciones y 10 camas.',
					rate: 'Tarifa: consultar por WhatsApp',
					alt: 'Cabaña de madera con techo verde junto a árboles altos en un día despejado',
				},
			],
		},
		awards: {
			title: 'Reconocimientos y apoyos',
			alt: 'Placas de reconocimiento de madera colgadas en una pared de ladrillo',
			items: [
				{ name: '1.er lugar Premio WISE El Salvador · Turismo y Ciencia', by: 'WISE' },
				{ name: 'Proyecto ganador Capital Semilla Transición Digital', by: 'KfW · DINÁMICA' },
				{ name: 'Capital Semilla · Programa de Desarrollo MYPE Verde', by: 'KOICA' },
				{ name: 'Proyecto Ilamatepec Turismo Naranja', by: 'Unión Europea' },
				{ name: 'Apoyo del Plan Trifinio', by: 'Plan Trifinio' },
				{ name: 'Sistema solar fotovoltaico 5.85 kWp', by: 'DINÁMICA II' },
				{ name: 'Sello Ambiental NTS 13.11.14:25', by: '' },
				{ name: 'Registro Nacional de Turismo: en trámite', by: '' },
			],
		},
		booking: {
			titleA: 'Te esperamos',
			titleB: 'entre la niebla',
			hours: 'Horario',
			hoursValue: '7 a.m. a 7 p.m.',
			from: 'Desde San Salvador',
			fromValue: '~3 h 30 min',
			location: 'Ubicación',
			locationValue: 'Cantón El Limo, Metapán, Santa Ana Norte',
			note: 'Algunos tramos requieren 4x4 según la unidad que reserves. Te confirmamos la ruta por WhatsApp.',
		},
		air: {
			eyebrow: 'Ciencia y monitoreo ambiental',
			title: 'El aire que respiras, medido',
			text: 'Tenemos una estación de calidad del aire en el hospedaje, en alianza con la Universidad de El Salvador y AireSV. Las mediciones son públicas.',
			more: 'Cómo medimos',
		},
	},
	en: {
		meta: {
			title: 'Cabañas Alpinas El Limo · Metapán',
			description:
				'A-frame cabins wrapped in cloud forest in El Limo, Metapán, in the buffer zone of the Trifinio Fraternidad Biosphere Reserve.',
		},
		hero: {
			eyebrow: 'Trifinio Fraternidad Biosphere Reserve · El Limo, Metapán',
			titleA: 'Wake up in the mountains,',
			titleB: 'live the serenity.',
			lead: "A-frame cabins wrapped in cloud forest, in the Americas' first tri-national reserve. Mist, wood, silence and morning coffee.",
			book: 'Book on WhatsApp',
			cabins: 'See the cabins',
			dayNight: 'Day or night',
			day: 'Day',
			night: 'Night',
			altDay: 'Two green-roofed A-frame cabins next to a garden under a blue sky',
			altNight: 'A-frame cabin lit from inside at night, surrounded by trees',
		},
		attrs: {
			title: 'Six reasons to stay in El Limo',
			lead: 'A rural lodge with real science behind it: air monitoring, marine fossils, solar power and a forest cared for every day.',
			items: [
				{
					title: 'Sleep in a biosphere reserve',
					text: 'In the buffer zone of Trifinio Fraternidad, the first tri-national reserve in the Americas.',
				},
				{
					title: 'A journey to the marine past',
					text: 'Cretaceous limestones with ammonites and rudists: this mountain was once a warm sea.',
				},
				{
					title: 'Sustainability you can verify',
					text: '5.85 kWp of solar power and Environmental Seal NTS 13.11.14:25.',
				},
				{
					title: 'Science and monitoring',
					text: 'Air-quality station with the University of El Salvador and AireSV.',
				},
				{
					title: 'Protecting biodiversity',
					text: 'Over 100 manzanas of forest. Members of the Feline Protection Roundtable: we protect their habitat.',
				},
				{
					title: 'Rural hospitality, authentic food',
					text: 'Farm to table: traditional breakfasts, free-range hen, tilapia and dairy.',
				},
			],
		},
		counters: {
			label: 'In numbers',
			items: [
				{ value: 100, decimals: 0, suffix: '+', unit: '', label: 'manzanas of protected forest' },
				{ value: 5.85, decimals: 2, suffix: '', unit: 'kWp', label: 'of installed solar power' },
				{ value: 3, decimals: 0, suffix: '', unit: '', label: 'countries share the reserve' },
				{ value: 2, decimals: 0, suffix: '', unit: '', label: 'A-frame alpine cabins' },
			],
		},
		cabins: {
			title: 'Where to sleep',
			all: 'All lodging',
			items: [
				{
					eyebrow: '2 A-frame cabins',
					name: 'Cabañas Alpinas',
					text: 'For 5 guests · 4 beds · kitchen · fridge · private bath. Amaris with access for sedans and minibuses.',
					rate: 'Reference rate: $120 per 24 h',
					alt: 'Front of the A-frame alpine cabin with a wooden balcony, lit at night',
				},
				{
					eyebrow: 'For groups and families',
					name: 'Sister lodge',
					text: '4 double rooms with private bath and a family cabin with 4 rooms and 10 beds.',
					rate: 'Rate: ask on WhatsApp',
					alt: 'Green-roofed wooden cabin next to tall trees on a clear day',
				},
			],
		},
		awards: {
			title: 'Recognition and support',
			alt: 'Wooden recognition plaques hanging on a brick wall',
			items: [
				{ name: '1st place, WISE El Salvador Award · Tourism & Science', by: 'WISE' },
				{ name: 'Seed Capital Award – Digital Transition', by: 'KfW · DINÁMICA' },
				{ name: 'Seed Capital · Green SME Development Program', by: 'KOICA' },
				{ name: 'Ilamatepec Orange Tourism Project', by: 'European Union' },
				{ name: 'Support from Plan Trifinio', by: 'Plan Trifinio' },
				{ name: '5.85 kWp solar PV system', by: 'DINÁMICA II' },
				{ name: 'Environmental Seal NTS 13.11.14:25', by: '' },
				{ name: 'National Tourism Registry: in process', by: '' },
			],
		},
		booking: {
			titleA: "We'll be waiting",
			titleB: 'in the mist',
			hours: 'Hours',
			hoursValue: '7 a.m. to 7 p.m.',
			from: 'From San Salvador',
			fromValue: '~3 h 30 min',
			location: 'Location',
			locationValue: 'Cantón El Limo, Metapán, Santa Ana Norte',
			note: 'Some stretches require 4x4 depending on the unit you book. We confirm the route on WhatsApp.',
		},
		air: {
			eyebrow: 'Science and environmental monitoring',
			title: 'The air you breathe, measured',
			text: 'There is an air-quality station at the lodge, run with the University of El Salvador and AireSV. Readings are public.',
			more: 'How we measure',
		},
	},
};
