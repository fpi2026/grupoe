/** Editor de una noticia: datos compartidos, portada y textos en español e inglés con vista previa. */
import { marked } from 'marked';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { newsTagIds, newsTags } from '../../data/noticias';
import { Conflicto, mensajeDeError } from '../lib/github';
import { comprimirImagen, tamano } from '../lib/imagen';
import {
	LANGS,
	borrarNoticia,
	estaVacio,
	guardarNoticia,
	noticiaNueva,
	slugDe,
	textoVacio,
	validar,
	type Errores,
	type Idioma,
	type Noticia,
	type Repo,
	type Texto,
} from '../lib/noticias';
import { Aviso, Boton, PortadaRepo, campo } from './ui';

const NOMBRE: Record<Idioma, string> = { es: 'Español', en: 'English' };

interface Props {
	datos: Repo;
	/** null = noticia nueva */
	slug: string | null;
	/** Se llama después de guardar o borrar, con el mensaje para mostrar. */
	onListo: (mensaje: string) => void;
	/** Vuelve a leer las noticias de GitHub (descarta lo editado). */
	onRecargar: () => void;
}

function MensajeError({ id, texto }: { id: string; texto?: string }) {
	return texto ? (
		<span id={id} class="text-sm font-semibold text-[#B23A2A]">
			{texto}
		</span>
	) : null;
}

export function EditorNoticia({ datos, slug, onListo, onRecargar }: Props) {
	const nueva = slug === null;
	const original = useMemo(() => (slug ? datos.noticias.find((n) => n.slug === slug) : undefined), [datos, slug]);

	const [n, setN] = useState<Noticia>(() =>
		original
			? { ...original, textos: { es: original.textos.es ?? textoVacio(), en: original.textos.en ?? textoVacio() } }
			: noticiaNueva(),
	);
	const [slugTocado, setSlugTocado] = useState(!nueva);
	const [lang, setLang] = useState<Idioma>('es');
	const [vista, setVista] = useState(false);
	const [portadaNueva, setPortadaNueva] = useState<{ blob: Blob; url: string; original: number } | null>(null);
	const [procesando, setProcesando] = useState(false);
	const [errores, setErrores] = useState<Errores>({});
	const [error, setError] = useState('');
	const [conflicto, setConflicto] = useState(false);
	const [guardando, setGuardando] = useState(false);
	const [confirmarBorrado, setConfirmarBorrado] = useState(false);
	const [intentado, setIntentado] = useState(false);
	const [inicial] = useState(() => JSON.stringify(n));
	const existentes = useMemo(() => new Set(datos.noticias.map((x) => x.slug)), [datos]);

	// Después del primer intento de guardar, los errores se actualizan mientras se corrige
	useEffect(() => {
		if (!intentado) return;
		const errs = validar(n, nueva, existentes, Boolean(portadaNueva));
		setErrores(errs);
		if (!Object.values(errs).some(Boolean)) setError('');
	}, [n, portadaNueva, intentado]);

	useEffect(() => () => portadaNueva && URL.revokeObjectURL(portadaNueva.url), [portadaNueva]);

	if (slug && !original) {
		return (
			<div class="flex flex-col gap-4">
				<Aviso tipo="error">No se encontró la noticia «{slug}».</Aviso>
				<a href="#/noticias">← Volver a noticias</a>
			</div>
		);
	}

	const set = (cambio: Partial<Noticia>) => setN((prev) => ({ ...prev, ...cambio }));
	const setTexto = (l: Idioma, cambio: Partial<Texto>) =>
		setN((prev) => {
			const textos = { ...prev.textos, [l]: { ...(prev.textos[l] ?? textoVacio()), ...cambio } };
			// En una noticia nueva, la dirección sale del primer título escrito
			const s = nueva && !slugTocado && cambio.titulo !== undefined && (l === 'es' || estaVacio(prev.textos.es)) ? slugDe(cambio.titulo) : prev.slug;
			return { ...prev, textos, slug: s };
		});
	const t = n.textos[lang] ?? textoVacio();

	async function elegirPortada(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const archivo = input.files?.[0];
		input.value = '';
		if (!archivo) return;
		setProcesando(true);
		setError('');
		try {
			const blob = await comprimirImagen(archivo);
			setPortadaNueva({ blob, url: URL.createObjectURL(blob), original: archivo.size });
			setErrores((prev) => ({ ...prev, portada: undefined }));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'No se pudo procesar la imagen.');
		} finally {
			setProcesando(false);
		}
	}

	async function guardar(e: Event) {
		e.preventDefault();
		setIntentado(true);
		const errs = validar(n, nueva, existentes, Boolean(portadaNueva));
		setErrores(errs);
		if (Object.values(errs).some(Boolean)) {
			setError('Revisa los campos marcados.');
			// Mostrar el idioma que tiene errores
			const conError = LANGS.find((l) => Object.keys(errs).some((k) => k.startsWith(`${l}.`)));
			if (conError) setLang(conError);
			return;
		}
		if (!nueva && !portadaNueva && JSON.stringify(n) === inicial) {
			setError('No hay cambios que guardar.');
			return;
		}
		setGuardando(true);
		setError('');
		try {
			await guardarNoticia(n, portadaNueva?.blob ?? null, nueva, datos);
			onListo(
				n.publicado
					? 'Noticia guardada. El sitio se actualizará en 1 o 2 minutos.'
					: 'Borrador guardado. No aparecerá en el sitio hasta que lo marques como publicado.',
			);
		} catch (err) {
			setConflicto(err instanceof Conflicto);
			setError(mensajeDeError(err));
		} finally {
			setGuardando(false);
		}
	}

	async function borrar() {
		setGuardando(true);
		setError('');
		try {
			await borrarNoticia(original!, datos);
			onListo('Noticia borrada. El cambio queda en el historial de GitHub.');
		} catch (err) {
			setConflicto(err instanceof Conflicto);
			setError(mensajeDeError(err));
			setConfirmarBorrado(false);
		} finally {
			setGuardando(false);
		}
	}

	const errT = (k: keyof Texto) => errores[`${lang}.${k}`];

	return (
		<form onSubmit={guardar} noValidate class="flex flex-col gap-8">
			<div class="flex flex-col gap-2">
				<a href="#/noticias" class="self-start text-sm font-semibold">
					← Noticias
				</a>
				<h1 class="m-0 font-serif text-[clamp(30px,4vw,44px)] leading-tight font-normal">
					{nueva ? 'Nueva noticia' : (original!.textos.es ?? original!.textos.en)?.titulo}
				</h1>
			</div>

			{/* Datos compartidos por ambos idiomas */}
			<fieldset class="m-0 grid gap-5 rounded-lg border border-line bg-card p-5 sm:grid-cols-2">
				<legend class="px-1 text-sm font-semibold text-muted">Datos de la noticia (ambos idiomas)</legend>

				<label class="flex flex-col gap-1.5 text-sm font-semibold">
					Dirección (slug)
					<input
						value={n.slug}
						disabled={!nueva}
						onInput={(e) => {
							setSlugTocado(true);
							set({ slug: e.currentTarget.value });
						}}
						onBlur={(e) => set({ slug: slugDe(e.currentTarget.value) })}
						aria-invalid={Boolean(errores.slug) || undefined}
						aria-describedby="e-slug a-slug"
						class={`${campo} font-mono text-sm disabled:opacity-70`}
					/>
					<span id="a-slug" class="font-normal text-muted">
						{nueva ? `Quedará en /noticias/${n.slug || '…'}/` : 'No se puede cambiar después de crear la noticia.'}
					</span>
					<MensajeError id="e-slug" texto={errores.slug} />
				</label>

				<label class="flex flex-col gap-1.5 text-sm font-semibold">
					Fecha
					<input
						type="date"
						value={n.fecha}
						onInput={(e) => set({ fecha: e.currentTarget.value })}
						aria-invalid={Boolean(errores.fecha) || undefined}
						aria-describedby="e-fecha"
						class={campo}
					/>
					<MensajeError id="e-fecha" texto={errores.fecha} />
				</label>

				<fieldset class="m-0 flex flex-col gap-2 border-0 p-0 sm:col-span-2" aria-describedby="e-etq">
					<legend class="mb-2 p-0 text-sm font-semibold">Etiquetas</legend>
					<div class="flex flex-wrap gap-2">
						{newsTagIds.map((id) => {
							const on = n.etiquetas.includes(id);
							return (
								<label key={id} class="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-line px-3 py-1.5 text-sm has-checked:border-ink">
									<input
										type="checkbox"
										checked={on}
										onChange={() => set({ etiquetas: on ? n.etiquetas.filter((x) => x !== id) : [...n.etiquetas, id] })}
										class="accent-forest"
									/>
									{newsTags[id].es}
								</label>
							);
						})}
					</div>
					<MensajeError id="e-etq" texto={errores.etiquetas} />
				</fieldset>

				<div class="flex flex-col gap-2 sm:col-span-2">
					<span class="text-sm font-semibold">Foto de portada</span>
					<div class="flex flex-wrap items-start gap-4">
						{portadaNueva ? (
							<img src={portadaNueva.url} alt="" class="aspect-[3/2] w-[240px] rounded-md object-cover" />
						) : n.portada ? (
							<PortadaRepo portada={n.portada} archivos={datos.archivos} class="aspect-[3/2] w-[240px] rounded-md" />
						) : (
							<div class="grid aspect-[3/2] w-[240px] place-items-center rounded-md border border-dashed border-line text-sm text-muted">
								Sin portada
							</div>
						)}
						<div class="flex flex-col gap-2">
							<label class="inline-flex h-11 cursor-pointer items-center self-start rounded-sm border border-line px-4 font-semibold focus-within:outline-2 focus-within:outline-forest hover:border-ink">
								{procesando ? 'Procesando…' : n.portada || portadaNueva ? 'Cambiar foto' : 'Subir foto'}
								<input type="file" accept="image/*" onChange={elegirPortada} class="sr-only" aria-describedby="e-portada a-portada" />
							</label>
							<span id="a-portada" class="text-sm text-muted">
								{portadaNueva
									? `Reducida a WebP: ${tamano(portadaNueva.original)} → ${tamano(portadaNueva.blob.size)}`
									: 'Se reduce a 1600 px y WebP antes de subirla.'}
							</span>
							<MensajeError id="e-portada" texto={errores.portada} />
						</div>
					</div>
				</div>

				<label class="flex items-center gap-3 text-sm font-semibold sm:col-span-2">
					<input type="checkbox" checked={n.publicado} onChange={(e) => set({ publicado: e.currentTarget.checked })} class="size-5 accent-forest" />
					Publicada
					<span class="font-normal text-muted">
						{n.publicado ? 'Aparece en el sitio.' : 'Borrador: se guarda, pero no aparece en el sitio.'}
					</span>
				</label>
			</fieldset>

			{/* Textos por idioma */}
			<section aria-label="Textos" class="flex flex-col gap-5">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div role="tablist" aria-label="Idioma" class="flex rounded-pill border border-line p-[3px]">
						{LANGS.map((l) => (
							<button
								key={l}
								type="button"
								role="tab"
								aria-selected={lang === l}
								onClick={() => setLang(l)}
								class="rounded-pill px-4 py-2 text-sm font-semibold aria-selected:bg-ink aria-selected:text-bg"
							>
								{NOMBRE[l]}
								{LANGS.length > 1 && Object.keys(errores).some((k) => k.startsWith(`${l}.`) && errores[k]) && ' ⚠'}
							</button>
						))}
					</div>
					<Boton variante="secundario" onClick={() => setVista(!vista)} aria-pressed={vista}>
						{vista ? 'Editar' : 'Vista previa'}
					</Boton>
				</div>

				{errores.textos && <Aviso tipo="error">{errores.textos}</Aviso>}
				<p class="m-0 text-sm text-muted">
					Si dejas un idioma vacío, la noticia solo aparecerá en el otro.
					{!nueva && original!.shas[lang] && estaVacio(t) && ` Al guardar se borrará la versión en ${NOMBRE[lang].toLowerCase()}.`}
				</p>

				{vista ? (
					<article lang={lang} class="flex max-w-[720px] flex-col gap-4 rounded-lg border border-line bg-bg p-6">
						<h2 class="m-0 font-serif text-[clamp(30px,4vw,48px)] leading-tight font-normal">{t.titulo || 'Sin título'}</h2>
						<p class="m-0 font-serif text-xl text-muted">{t.resumen}</p>
						<div class="vista-md flex flex-col gap-4 text-lg" dangerouslySetInnerHTML={{ __html: marked.parse(t.cuerpo, { async: false }) }} />
					</article>
				) : (
					<div lang={lang} class="flex flex-col gap-5">
						<label class="flex flex-col gap-1.5 text-sm font-semibold">
							Título
							<input
								value={t.titulo}
								onInput={(e) => setTexto(lang, { titulo: e.currentTarget.value })}
								aria-invalid={Boolean(errT('titulo')) || undefined}
								aria-describedby="e-titulo"
								class={`${campo} font-serif text-xl`}
							/>
							<MensajeError id="e-titulo" texto={errT('titulo')} />
						</label>
						<label class="flex flex-col gap-1.5 text-sm font-semibold">
							Resumen
							<textarea
								rows={2}
								value={t.resumen}
								onInput={(e) => setTexto(lang, { resumen: e.currentTarget.value })}
								aria-invalid={Boolean(errT('resumen')) || undefined}
								aria-describedby="e-resumen a-resumen"
								class={`${campo} resize-y`}
							/>
							<span id="a-resumen" class="font-normal text-muted">
								Aparece en la lista y al compartir en redes. Una o dos oraciones.
							</span>
							<MensajeError id="e-resumen" texto={errT('resumen')} />
						</label>
						<label class="flex flex-col gap-1.5 text-sm font-semibold">
							Descripción de la foto de portada
							<input
								value={t.portadaAlt}
								onInput={(e) => setTexto(lang, { portadaAlt: e.currentTarget.value })}
								aria-invalid={Boolean(errT('portadaAlt')) || undefined}
								aria-describedby="e-alt a-alt"
								class={campo}
							/>
							<span id="a-alt" class="font-normal text-muted">
								Para personas que no pueden ver la imagen. Describe lo que se ve, no lo que significa.
							</span>
							<MensajeError id="e-alt" texto={errT('portadaAlt')} />
						</label>
						<label class="flex flex-col gap-1.5 text-sm font-semibold">
							Texto de la noticia
							<textarea
								rows={12}
								value={t.cuerpo}
								onInput={(e) => setTexto(lang, { cuerpo: e.currentTarget.value })}
								aria-describedby="a-cuerpo"
								class={`${campo} resize-y font-mono text-sm leading-relaxed`}
							/>
							<span id="a-cuerpo" class="font-normal text-muted">
								Deja una línea en blanco entre párrafos. **negrita**, *cursiva*, ## Subtítulo, - lista, [enlace](https://…)
							</span>
						</label>
					</div>
				)}
			</section>

			{error && (
				<Aviso tipo="error">
					{error}
					{conflicto && (
						<>
							{' '}
							<button type="button" onClick={onRecargar} class="font-semibold underline">
								Recargar la noticia (se pierden los cambios sin guardar)
							</button>
						</>
					)}
				</Aviso>
			)}

			<div class="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-bg px-4 py-4">
				{!nueva && !confirmarBorrado && (
					<Boton variante="peligro" onClick={() => setConfirmarBorrado(true)} disabled={guardando}>
						Borrar noticia
					</Boton>
				)}
				{confirmarBorrado && (
					<div role="alertdialog" aria-label="Confirmar borrado" class="flex flex-wrap items-center gap-3">
						<span class="text-sm font-semibold">¿Borrar en ambos idiomas? Se puede recuperar desde el historial de GitHub.</span>
						<Boton variante="peligro" onClick={borrar} disabled={guardando} autoFocus>
							{guardando ? 'Borrando…' : 'Sí, borrar'}
						</Boton>
						<Boton variante="secundario" onClick={() => setConfirmarBorrado(false)} disabled={guardando}>
							Cancelar
						</Boton>
					</div>
				)}
				<div class="ml-auto flex gap-3">
					<a href="#/noticias" class="inline-flex h-11 items-center px-2 font-semibold">
						Cancelar
					</a>
					<Boton type="submit" disabled={guardando || procesando || confirmarBorrado}>
						{guardando && !confirmarBorrado ? 'Guardando…' : n.publicado ? 'Guardar y publicar' : 'Guardar borrador'}
					</Boton>
				</div>
			</div>
		</form>
	);
}
