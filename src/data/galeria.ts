/**
 * Fotos de la Galería: archivo en src/assets/img/, categoría y texto
 * alternativo ES/EN (descripción de lo que se ve en la foto).
 * En la fase del CMS, esta lista pasará a un archivo editable.
 */
import type { Lang } from '../i18n/ui';

export const categories = [
	{ id: 'all', es: 'Todo', en: 'All' },
	{ id: 'cabanas', es: 'Cabañas', en: 'Cabins' },
	{ id: 'naturaleza', es: 'Naturaleza', en: 'Nature' },
	{ id: 'fosiles', es: 'Fósiles', en: 'Fossils' },
	{ id: 'gastronomia', es: 'Gastronomía', en: 'Food' },
	{ id: 'comunidad', es: 'Comunidad', en: 'Community' },
	{ id: 'sostenibilidad', es: 'Sostenibilidad', en: 'Sustainability' },
] as const;
export type CategoryId = Exclude<(typeof categories)[number]['id'], 'all'>;

export interface GalleryItem {
	file: string;
	cat: CategoryId;
	es: string;
	en: string;
}

export const galeria: GalleryItem[] = [
	{ file: 'noche-cabana', cat: 'cabanas', es: 'Cabaña alpina iluminada en la noche', en: 'Alpine cabin lit up at night' },
	{ file: 'dia-cabanas', cat: 'cabanas', es: 'Dos cabañas tipo A frente al jardín', en: 'Two A-frame cabins facing the garden' },
	{ file: 'montana', cat: 'naturaleza', es: 'Montañas cubiertas de bosque con un rayo de sol', en: 'Forest-covered mountains with a ray of sunlight' },
	{ file: 'amonitas', cat: 'fosiles', es: 'Amonitas fósiles pulidas', en: 'Polished fossil ammonites' },
	{ file: 'desayuno', cat: 'gastronomia', es: 'Desayuno típico sobre mesa de madera', en: 'Traditional breakfast on a wooden table' },
	{ file: 'cascada', cat: 'naturaleza', es: 'Cascada El Limo', en: 'El Limo Waterfall' },
	{ file: 'terraza-grupo', cat: 'comunidad', es: 'Charla con un grupo en la terraza', en: 'Talk with a group on the terrace' },
	{ file: 'hongo-rojo', cat: 'naturaleza', es: 'Hongo rojo en el suelo del bosque', en: 'Red mushroom on the forest floor' },
	{ file: 'noche-cabana-2', cat: 'cabanas', es: 'Fachada de la cabaña alpina de noche', en: 'Front of the alpine cabin at night' },
	{ file: 'solar-techo', cat: 'sostenibilidad', es: 'Instalación de paneles solares en el techo', en: 'Installing solar panels on the roof' },
	{ file: 'fosil-1', cat: 'fosiles', es: 'Fósil en roca con tonos de óxido', en: 'Fossil in rust-coloured rock' },
	{ file: 'pan-cabana', cat: 'gastronomia', es: 'Pan artesanal con la cabaña al fondo', en: 'Homemade bread with the cabin behind' },
	{ file: 'escarabajo', cat: 'naturaleza', es: 'Escarabajo dorado sobre una mano', en: 'Golden beetle on a hand' },
	{ file: 'estudiantes', cat: 'comunidad', es: 'Grupo de estudiantes en el jardín de las cabañas', en: 'Group of students in the cabins’ garden' },
	{ file: 'terraza-noche', cat: 'gastronomia', es: 'Terraza de noche con luces cálidas', en: 'Terrace at night with warm lights' },
	{ file: 'hongo-blanco', cat: 'naturaleza', es: 'Hongo blanco gelatinoso sobre tronco con musgo', en: 'White jelly fungus on a mossy log' },
	{ file: 'solar-bateria', cat: 'sostenibilidad', es: 'Inversor y batería del sistema solar', en: 'Inverter and battery of the solar system' },
	{ file: 'fosil-2', cat: 'fosiles', es: 'Amonita en caliza', en: 'Ammonite in limestone' },
	{ file: 'dia-cabana', cat: 'cabanas', es: 'Cabaña alpina en un día despejado', en: 'Alpine cabin on a clear day' },
	{ file: 'reconocimientos', cat: 'comunidad', es: 'Placas de reconocimiento', en: 'Recognition plaques' },
	{ file: 'estantes', cat: 'gastronomia', es: 'Estantes de ladrillo con bebidas artesanales', en: 'Brick shelves with craft drinks' },
	{ file: 'panorama', cat: 'naturaleza', es: 'Vista panorámica desde la terraza', en: 'Panoramic view from the terrace' },
	{ file: 'entrada', cat: 'naturaleza', es: 'Sendero con paneles informativos junto al bosque', en: 'Trail with information panels beside the forest' },
	{ file: 'amonitas-2', cat: 'fosiles', es: 'Colección de amonitas', en: 'Collection of ammonites' },
	{ file: 'desayuno-2', cat: 'gastronomia', es: 'Desayuno con el bosque al fondo', en: 'Breakfast with the forest behind' },
];

export const galeriaText: Record<
	Lang,
	{ title: string; description: string; filter: string; enlarge: string; viewer: string; close: string; prev: string; next: string }
> = {
	es: {
		title: 'Galería',
		description: 'Fotos de las cabañas, el bosque, los fósiles, la gastronomía y la comunidad de Cabañas Alpinas El Limo.',
		filter: 'Filtrar por categoría',
		enlarge: 'Ampliar:',
		viewer: 'Visor de imágenes',
		close: 'Cerrar visor',
		prev: 'Imagen anterior',
		next: 'Imagen siguiente',
	},
	en: {
		title: 'Gallery',
		description: 'Photos of the cabins, the forest, the fossils, the food and the community at Cabañas Alpinas El Limo.',
		filter: 'Filter by category',
		enlarge: 'Enlarge:',
		viewer: 'Image viewer',
		close: 'Close viewer',
		prev: 'Previous image',
		next: 'Next image',
	},
};
