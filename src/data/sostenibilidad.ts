/**
 * Contenido de la página de Sostenibilidad y aire en español e inglés.
 * Fuentes: Informe institucional (secciones 3 a 6), Plan del sitio (texto
 * de calidad del aire), Propuesta pedagógica (1 manzana ≈ 0.7 ha) y, para
 * «Qué es AireSV», el sitio de AireSV (airesv.esaapp.com: Sobre nosotros,
 * Educación y Preguntas frecuentes, consultado el 23 nov 2026, pedido de Natan).
 */
import type { Lang } from '../i18n/ui';

export interface SustainabilityContent {
	meta: { title: string; description: string };
	intro: { eyebrow: string; titleA: string; titleB: string; lead: string };
	solar: { label: string; text: string; alts: [string, string] };
	practices: { title: string; items: { kicker: string; title: string; text: string }[] };
	air: {
		eyebrow: string;
		title: string;
		text: string;
		glossary: { k: string; v: string }[];
		about: {
			title: string;
			text: string[];
			features: { title: string; text: string }[];
			scaleTitle: string;
			scaleNote: string;
			/** Del mejor al peor nivel (colores de AirCard). */
			levels: { name: string; range: string; advice: string }[];
			credit: string;
		};
	};
}

export const sostenibilidad: Record<Lang, SustainabilityContent> = {
	es: {
		meta: {
			title: 'Sostenibilidad y aire',
			description:
				'Energía solar de 5.85 kWp, más de 100 manzanas de bosque protegidas, Sello Ambiental NTS 13.11.14:25 y una estación de calidad del aire con la UES y AireSV.',
		},
		intro: {
			eyebrow: 'Sostenibilidad',
			titleA: 'Cuidar el bosque',
			titleB: 'con datos',
			lead: 'Lo que hacemos se puede ver y medir: paneles en el techo, una estación de aire con datos públicos y un sello ambiental.',
		},
		solar: {
			label: 'Energía solar',
			text: 'Sistema solar fotovoltaico, con apoyo del programa DINÁMICA II: energías renovables y menos dependencia de la electricidad convencional.',
			alts: [
				'Técnicos instalando paneles solares sobre el techo verde, con montañas al fondo',
				'Inversor y batería del sistema fotovoltaico instalados bajo techo',
			],
		},
		practices: {
			title: 'Prácticas ambientales',
			items: [
				{
					kicker: 'Bosque',
					title: 'Más de 100 manzanas protegidas',
					text: 'Unas 70 hectáreas de ecosistemas de montaña, vegetación nativa y fuentes de agua, en la zona de influencia de la Reserva de la Biosfera Trifinio Fraternidad.',
				},
				{
					kicker: 'Fauna',
					title: 'Mesa de Protección de Felinos',
					text: 'Participamos en la Mesa y protegemos el hábitat de los felinos silvestres. No prometemos avistamientos.',
				},
				{
					kicker: 'Certificación',
					title: 'Sello Ambiental NTS 13.11.14:25',
					text: 'Sello Ambiental vinculado a la norma salvadoreña NTS 13.11.14:25, como parte de nuestro compromiso con la gestión ambiental en el turismo.',
				},
				{
					kicker: 'Agua',
					title: 'Fosa séptica biológica',
					text: 'Tratamiento de las aguas residuales del hospedaje mediante procesos biológicos, para reducir el riesgo de contaminar el entorno.',
				},
				{
					kicker: 'Residuos',
					title: 'Compostaje',
					text: 'Los residuos orgánicos se transforman en compost para devolver nutrientes al suelo.',
				},
				{
					kicker: 'Residuos',
					title: 'Separación y reciclaje',
					text: 'Clasificamos los residuos desde su origen y aprovechamos los materiales reutilizables.',
				},
				{
					kicker: 'Materiales',
					title: 'Madera de árboles caídos',
					text: 'Reutilización creativa de materiales y aprovechamiento responsable de madera de árboles caídos en algunas instalaciones.',
				},
				{
					kicker: 'Alimentos',
					title: 'Huerta y producción local',
					text: 'Productos de nuestra huerta y de actividades agropecuarias llegan a la mesa de los visitantes.',
				},
				{
					kicker: 'Ventilación',
					title: 'Extractores eólicos',
					text: 'Aprovechamos el viento para ventilar la cocina.',
				},
			],
		},
		air: {
			eyebrow: 'Calidad del aire',
			title: 'Respiramos aire limpio, y lo medimos',
			text: 'Cabañas Alpinas El Limo tiene una estación de monitoreo de la calidad del aire, desarrollada con la Universidad de El Salvador (UES) y AireSV. Mide el Índice de Calidad del Aire (ICA), las partículas PM2.5 y PM10 y el CO₂. Consulta las mediciones en la app AireSV o en el historial de la estación.',
			glossary: [
				{ k: 'ICA', v: 'Índice de Calidad del Aire: resume la calidad del aire en un número, con un color por nivel.' },
				{ k: 'PM2.5', v: 'Partículas finas de menos de 2.5 micras, como polvo y humo. Penetran hasta el fondo de los pulmones.' },
				{ k: 'PM10', v: 'Partículas de menos de 10 micras, como el polvo de caminos y de la agricultura. Afectan las vías respiratorias.' },
				{ k: 'CO₂', v: 'Dióxido de carbono, medido en partes por millón (ppm). En interiores con poca ventilación, los niveles altos causan dolor de cabeza y somnolencia.' },
			],
			about: {
				title: 'Qué es AireSV',
				text: [
					'AireSV es una plataforma que reúne y muestra los datos de calidad del aire de El Salvador. Nació para centralizar esa información y hacerla accesible a todos, como apoyo a la salud pública y la prevención.',
					'Los datos vienen de estaciones de monitoreo y sensores en municipios clave del país. Antes de publicarse, se validan, se corrigen y se verifican.',
				],
				features: [
					{ title: 'Mapa interactivo', text: 'La calidad del aire de cada municipio, con colores y zoom.' },
					{ title: 'Historial', text: 'Registro de todas las mediciones, con la fecha y hora de la última actualización de cada zona.' },
					{ title: 'Recomendaciones de salud', text: 'Consejos y precauciones según el nivel de contaminación del momento.' },
					{ title: 'Guía de contaminantes', text: 'Además del ICA, partículas y gases de cada zona, temperatura y humedad, y qué es cada uno.' },
				],
				scaleTitle: 'Cómo se lee el ICA',
				scaleNote:
					'AireSV calcula el ICA con la fórmula de la EPA, por separado para cada contaminante. El número que se muestra no es un promedio: lo define el contaminante con el valor más alto.',
				levels: [
					{ name: 'Buena', range: '0–50', advice: 'Aire adecuado para la mayoría. Puedes hacer actividades al aire libre con normalidad.' },
					{ name: 'Moderada', range: '51–100', advice: 'Aceptable. Las personas muy sensibles pueden notar molestias leves.' },
					{ name: 'Dañina a sensibles', range: '101–150', advice: 'Niños, adultos mayores y personas con enfermedades respiratorias deben limitar el ejercicio intenso al aire libre.' },
					{ name: 'Dañina', range: '151–200', advice: 'Evita las actividades prolongadas al aire libre.' },
					{ name: 'Muy dañina', range: '201–300', advice: 'Riesgo elevado para todos. Mejor permanecer en interiores.' },
					{ name: 'Peligrosa', range: '301–500', advice: 'Emergencia de salud pública: evita salir y cierra las ventanas.' },
				],
				credit: 'Responsable del proyecto AireSV: Ing. Ernesto Alexander Calderón Peraza. Información tomada de airesv.esaapp.com.',
			},
		},
	},
	en: {
		meta: {
			title: 'Sustainability & air',
			description:
				'5.85 kWp of solar power, over 100 manzanas of protected forest, Environmental Seal NTS 13.11.14:25 and an air-quality station with UES and AireSV.',
		},
		intro: {
			eyebrow: 'Sustainability',
			titleA: 'Caring for the forest',
			titleB: 'with data',
			lead: 'What we do can be seen and measured: panels on the roof, an air station with public data and an environmental seal.',
		},
		solar: {
			label: 'Solar power',
			text: 'Solar PV system, supported by the DINÁMICA II programme: renewable energy and less reliance on conventional electricity.',
			alts: [
				'Technicians installing solar panels on the green roof, with mountains behind',
				'Inverter and battery of the PV system installed under a roof',
			],
		},
		practices: {
			title: 'Environmental practices',
			items: [
				{
					kicker: 'Forest',
					title: 'Over 100 manzanas protected',
					text: 'About 70 hectares of mountain ecosystems, native vegetation and water sources, in the area of influence of the Trifinio Fraternidad Biosphere Reserve.',
				},
				{
					kicker: 'Wildlife',
					title: 'Feline Protection Roundtable',
					text: 'We take part in the Roundtable and protect the habitat of wild cats. We do not promise sightings.',
				},
				{
					kicker: 'Certification',
					title: 'Environmental Seal NTS 13.11.14:25',
					text: 'Environmental Seal under the Salvadoran standard NTS 13.11.14:25, part of our commitment to environmental management in tourism.',
				},
				{
					kicker: 'Water',
					title: 'Biological septic system',
					text: 'Wastewater from the lodge is treated through biological processes, reducing the risk of polluting the surroundings.',
				},
				{
					kicker: 'Waste',
					title: 'Composting',
					text: 'Organic waste is turned into compost to return nutrients to the soil.',
				},
				{
					kicker: 'Waste',
					title: 'Sorting and recycling',
					text: 'We sort waste at the source and reuse materials that can be reused.',
				},
				{
					kicker: 'Materials',
					title: 'Wood from fallen trees',
					text: 'Creative reuse of materials and responsible use of wood from fallen trees in some facilities.',
				},
				{
					kicker: 'Food',
					title: 'Garden and local produce',
					text: 'Produce from our garden and farm activities reaches our guests’ table.',
				},
				{
					kicker: 'Ventilation',
					title: 'Wind-driven extractors',
					text: 'We use the wind to ventilate the kitchen.',
				},
			],
		},
		air: {
			eyebrow: 'Air quality',
			title: 'We breathe clean air, and we measure it',
			text: 'Cabañas Alpinas El Limo hosts an air quality monitoring station developed with the University of El Salvador (UES) and AireSV. It tracks the Air Quality Index (AQI), PM2.5 and PM10 particles and CO₂. See the readings in the AireSV app or in the station’s history.',
			glossary: [
				{ k: 'AQI', v: 'Air Quality Index: sums up air quality in one number, with a colour per level.' },
				{ k: 'PM2.5', v: 'Fine particles under 2.5 microns, such as dust and smoke. They reach deep into the lungs.' },
				{ k: 'PM10', v: 'Particles under 10 microns, such as dust from roads and farming. They affect the airways.' },
				{ k: 'CO₂', v: 'Carbon dioxide, measured in parts per million (ppm). Indoors with poor ventilation, high levels cause headaches and drowsiness.' },
			],
			about: {
				title: 'What AireSV is',
				text: [
					'AireSV is a platform that gathers and displays air quality data for El Salvador. It was created to bring that information together and make it available to everyone, in support of public health and prevention.',
					'The data comes from monitoring stations and sensors in key municipalities across the country. Before it is published, it is validated, corrected and checked.',
				],
				features: [
					{ title: 'Interactive map', text: 'Air quality for each municipality, with colours and zoom.' },
					{ title: 'History', text: 'A record of every reading, with the date and time of the latest update for each area.' },
					{ title: 'Health advice', text: 'Tips and precautions for the current pollution level.' },
					{ title: 'Pollutant guide', text: 'Besides the AQI, particles and gases for each area, temperature and humidity, and what each one is.' },
				],
				scaleTitle: 'How to read the AQI',
				scaleNote:
					'AireSV calculates the AQI with the EPA formula, separately for each pollutant. The number shown is not an average: it is set by the pollutant with the highest value.',
				levels: [
					{ name: 'Good', range: '0–50', advice: 'Air is fine for most people. Outdoor activities as usual.' },
					{ name: 'Moderate', range: '51–100', advice: 'Acceptable. Very sensitive people may feel mild discomfort.' },
					{ name: 'Unhealthy for sensitive groups', range: '101–150', advice: 'Children, older adults and people with respiratory conditions should limit intense outdoor exercise.' },
					{ name: 'Unhealthy', range: '151–200', advice: 'Avoid long outdoor activities.' },
					{ name: 'Very unhealthy', range: '201–300', advice: 'High risk for everyone. Better to stay indoors.' },
					{ name: 'Hazardous', range: '301–500', advice: 'Public health emergency: avoid going out and close the windows.' },
				],
				credit: 'AireSV project lead: Ing. Ernesto Alexander Calderón Peraza. Information from airesv.esaapp.com.',
			},
		},
	},
};
