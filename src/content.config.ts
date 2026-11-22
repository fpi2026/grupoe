/**
 * Colecciones de contenido. Noticias: src/content/noticias/{es,en}/<slug>.md.
 * El mismo <slug> en ambas carpetas enlaza la traducción.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { newsTagIds } from './data/noticias';

const noticias = defineCollection({
	loader: glob({ base: './src/content/noticias', pattern: '{es,en}/*.md' }),
	schema: ({ image }) =>
		z.object({
			titulo: z.string().min(1),
			fecha: z.coerce.date(),
			portada: image(),
			portadaAlt: z.string().min(1),
			resumen: z.string().min(1),
			etiquetas: z.array(z.enum(newsTagIds)).min(1),
			/** false = borrador: se guarda, pero no aparece en el sitio. */
			publicado: z.boolean().default(true),
		}),
});

export const collections = { noticias };
