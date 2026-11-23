/**
 * Contenido que edita el panel /admin: archivos JSON en src/content/datos/.
 * Aquí se validan al compilar (si un archivo no cumple el esquema, la compilación falla
 * y el sitio publicado no cambia) y se resuelven sus fotos.
 *
 * Las fotos se escriben en el JSON como ruta dentro de src/assets/, por ejemplo
 * "img/cascada.jpg" (fotos originales del sitio) o "subidas/galeria-x.webp" (subidas desde el panel).
 */
import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';
import type { Lang } from '../i18n/ui';
import reconocimientosJson from '../content/datos/reconocimientos.json';
import menuJson from '../content/datos/menu.json';
import sitioJson from '../content/datos/sitio.json';
import experienciasJson from '../content/datos/experiencias.json';

// ---------- Fotos ----------

const fotos = import.meta.glob<{ default: ImageMetadata }>('../assets/{img,subidas}/*.{jpg,jpeg,png,webp}', { eager: true });

/** Foto de src/assets/ a partir de su ruta en el JSON ("img/cascada.jpg"). */
export function foto(ruta: string): ImageMetadata {
	const m = fotos[`../assets/${ruta}`];
	if (!m) throw new Error(`No existe la foto src/assets/${ruta} (revisa el JSON en src/content/datos/).`);
	return m.default;
}

/** Ruta de foto válida: dentro de img/ o subidas/. Vacía = sin foto («Foto pendiente»). */
const rutaFoto = z.string().superRefine((r, ctx) => {
	if (r !== '' && !(`../assets/${r}` in fotos)) ctx.addIssue({ code: 'custom', message: `No existe la foto src/assets/${r}` });
});

// ---------- Esquemas ----------

/** Texto en los dos idiomas. El inglés puede quedar vacío: se usa el español. */
const bilingue = z.object({ es: z.string(), en: z.string() });
const bilingueObligatorio = z.object({ es: z.string().min(1), en: z.string() });

/** Texto en el idioma pedido; si falta la traducción, el español. */
export const en = (t: { es: string; en: string }, lang: Lang) => (lang === 'en' && t.en.trim() ? t.en : t.es);

function validar<T extends z.ZodTypeAny>(esquema: T, datos: unknown, archivo: string): z.infer<T> {
	const r = esquema.safeParse(datos);
	if (!r.success) throw new Error(`src/content/datos/${archivo} no es válido:\n${r.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n')}`);
	return r.data;
}

// ---------- Reconocimientos ----------

const reconocimiento = z.object({
	nombre: bilingueObligatorio,
	entidad: bilingue,
	/** Opcional, cuatro cifras. */
	anio: z.string().regex(/^(\d{4})?$/),
	/** Opcional. */
	logo: rutaFoto,
});

export const reconocimientos = validar(z.object({ items: z.array(reconocimiento) }), reconocimientosJson, 'reconocimientos.json').items;
export type Reconocimiento = z.infer<typeof reconocimiento>;

// ---------- Gastronomía ----------

const menu = z.object({
	/** Se destaca junto al título de la página. */
	nota: bilingueObligatorio,
	platillos: z.array(z.object({ nombre: bilingueObligatorio, descripcion: bilingue })),
	fotos: z.array(z.object({ foto: rutaFoto.refine((r) => r !== '', 'Falta la foto'), alt: bilingueObligatorio })),
});

export const menuGastronomia = validar(menu, menuJson, 'menu.json');

// ---------- Textos y avisos del sitio ----------
// Los usan src/data/sitio.ts (sin validar, para i18n/ui.ts); aquí se validan al compilar.

validar(
	z.object({
		aviso: z.object({ activo: z.boolean(), tono: z.enum(['info', 'alerta']), texto: bilingue }).refine((a) => !a.activo || a.texto.es.trim(), 'Un aviso activo necesita texto en español'),
		contacto: z.object({
			whatsapp: z.string().regex(/^\+\d[\d\s-]{6,}$/, 'WhatsApp con código de país, por ejemplo +503 7568-3400'),
			correo: z.union([z.literal(''), z.email()]),
			horario: bilingueObligatorio,
		}),
		lema: bilingue,
		portada: z.object({ antetitulo: bilingue, titulo: bilingueObligatorio, texto: bilingue }),
	}),
	sitioJson,
	'sitio.json',
);

// ---------- Experiencias ----------

const experiencia = z
	.object({
		titulo: bilingueObligatorio,
		texto: bilingue,
		/** Datos breves, por ejemplo «2 días · ascenso de 7 h». */
		duracion: bilingue,
		dificultad: z.enum(['', 'baja', 'media', 'alta']),
		/** Vacía = «Foto pendiente». */
		foto: rutaFoto,
		alt: bilingue,
	})
	.refine((x) => !x.foto || x.alt.es.trim(), 'Una experiencia con foto necesita su descripción en español');

export const experienciasSitio = validar(z.object({ aviso: bilingue, items: z.array(experiencia) }), experienciasJson, 'experiencias.json');
