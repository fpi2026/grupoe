/**
 * Editor de una noticia (diseno/Panel-EditorNoticia.dc.html): textos por idioma con pestañas
 * ES | EN, barra de formato y vista previa; datos compartidos en el panel lateral; barra de
 * guardar fija abajo.
 */
import { marked } from 'marked';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { newsTagIds, newsTags } from '../../data/noticias';
import { Conflicto, mensajeDeError } from '../lib/github';
import { esDemo } from '../lib/demo';
import {
	LANGS,
	MAX_RESUMEN,
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
import { protegerSalida } from '../lib/salida';
import { BarraGuardar } from './BarraGuardar';
import { SelectorFoto, type FotoNueva } from './SelectorFoto';
import { Aviso, Boton, Insignia, avisar, ayudaCampo, campo, contenedor, etiquetaCampo, usePortadaRepo } from './ui';

const PESTANAS: [Idioma, string][] = [
	['es', 'ES · Español'],
	['en', 'EN · English'],
];

interface Props {
	datos: Repo;
	/** null = noticia nueva */
	slug: string | null;
	/** Después de guardar: dirección de la noticia y sha del commit. */
	onGuardado: (slug: string, sha: string) => void;
	onBorrado: (sha: string) => void;
	/** Vuelve a leer las noticias de GitHub (descarta lo editado). */
	onRecargar: () => void;
}

function MensajeError({ id, texto }: { id: string; texto?: string }) {
	return texto ? (
		<span id={id} class="text-sm font-semibold text-danger">
			{texto}
		</span>
	) : null;
}

const Obligatorio = () => (
	<span class="text-danger" aria-hidden="true">
		{' '}
		*
	</span>
);

export function EditorNoticia({ datos, slug, onGuardado, onBorrado, onRecargar }: Props) {
	const nueva = slug === null;
	const original = useMemo(() => (slug ? datos.noticias.find((n) => n.slug === slug) : undefined), [datos, slug]);

	const [n, setN] = useState<Noticia>(() =>
		original
			? { ...original, textos: { es: original.textos.es ?? textoVacio(), en: original.textos.en ?? textoVacio() } }
			: noticiaNueva(),
	);
	const [inicial] = useState(() => JSON.stringify(n));
	const [slugTocado, setSlugTocado] = useState(!nueva);
	const [lang, setLang] = useState<Idioma>('es');
	const [vista, setVista] = useState(false);
	const [foto, setFoto] = useState<FotoNueva | null>(null);
	const [errores, setErrores] = useState<Errores>({});
	const [intentado, setIntentado] = useState(false);
	const [error, setError] = useState('');
	const [conflicto, setConflicto] = useState(false);
	const [guardando, setGuardando] = useState(false);
	/** Destino al que se quiso ir con cambios sin guardar. */
	const [salida, setSalida] = useState<string | null>(null);
	/** Ya se guardó o borró: no detener la navegación que sigue. */
	const [terminado, setTerminado] = useState(false);
	const cuerpoRef = useRef<HTMLTextAreaElement>(null);

	const fotoActual = usePortadaRepo(n.portada, datos.archivos);
	const ocupados = useMemo(() => new Set(datos.noticias.map((x) => x.slug).filter((s) => s !== original?.slug)), [datos, original]);
	const sucio = Boolean(foto) || JSON.stringify(n) !== inicial;

	// Después del primer intento de guardar, los errores se actualizan mientras se corrige
	useEffect(() => {
		if (intentado) setErrores(validar(n, ocupados, Boolean(n.portada || foto)));
	}, [n, foto, intentado]);

	useEffect(() => () => foto && URL.revokeObjectURL(foto.url), [foto]);

	// Cambios sin guardar: detener la navegación dentro del panel y avisar aquí mismo
	useEffect(() => {
		protegerSalida(
			sucio && !guardando && !terminado
				? (destino) => {
						setSalida(`#${destino}`);
						window.scrollTo({ top: 0, behavior: 'smooth' });
						return true;
					}
				: null,
		);
		return () => protegerSalida(null);
	}, [sucio, guardando, terminado]);

	if (slug && !original) {
		return (
			<div class={`${contenedor} flex flex-col gap-4`}>
				<Aviso tipo="error">No se encontró la noticia «{slug}». Puede que alguien la haya borrado o le haya cambiado la dirección.</Aviso>
				<a href="#/noticias" class="self-start font-semibold">
					← Noticias
				</a>
			</div>
		);
	}

	const set = (cambio: Partial<Noticia>) => setN((prev) => ({ ...prev, ...cambio }));
	const setTexto = (l: Idioma, cambio: Partial<Texto>) =>
		setN((prev) => {
			const textos = { ...prev.textos, [l]: { ...(prev.textos[l] ?? textoVacio()), ...cambio } };
			// En una noticia nueva, la dirección sale del título en español
			const s = nueva && !slugTocado && l === 'es' && cambio.titulo !== undefined ? slugDe(cambio.titulo) : prev.slug;
			return { ...prev, textos, slug: s };
		});
	const t = n.textos[lang] ?? textoVacio();
	const faltaIngles = estaVacio(n.textos.en);
	const err = (k: keyof Texto) => errores[`${lang}.${k}`];
	const conError = (l: Idioma) => Object.keys(errores).some((k) => k.startsWith(`${l}.`) && errores[k]);
	const cuantosErrores = Object.values(errores).filter(Boolean).length;

	/** Envuelve la selección del texto con marcas de Markdown (barra de formato). */
	function envolver(antes: string, despues: string, ejemplo: string) {
		const ta = cuerpoRef.current;
		if (!ta) return;
		const { selectionStart: a, selectionEnd: b, value: v } = ta;
		const sel = v.slice(a, b) || ejemplo;
		setTexto(lang, { cuerpo: v.slice(0, a) + antes + sel + despues + v.slice(b) });
		requestAnimationFrame(() => {
			ta.focus();
			ta.setSelectionRange(a + antes.length, a + antes.length + sel.length);
		});
	}

	const herramientas: [string, string, string, () => void][] = [
		['B', 'Negrita', 'font-serif text-base font-bold', () => envolver('**', '**', 'texto')],
		['I', 'Cursiva', 'font-serif text-[17px] font-medium italic', () => envolver('*', '*', 'texto')],
		['H', 'Subtítulo', 'text-[15px] font-semibold', () => envolver('\n\n## ', '\n\n', 'Subtítulo')],
		['• Lista', 'Lista', 'text-sm font-semibold', () => envolver('\n\n- ', '\n', 'elemento')],
		['Enlace', 'Enlace', 'text-sm font-semibold', () => envolver('[', '](https://)', 'texto del enlace')],
	];

	async function guardar() {
		setIntentado(true);
		const errs = validar(n, ocupados, Boolean(n.portada || foto));
		setErrores(errs);
		if (Object.values(errs).some(Boolean)) {
			setError('');
			setVista(false);
			const idioma = LANGS.find((l) => Object.keys(errs).some((k) => k.startsWith(`${l}.`)));
			if (idioma) setLang(idioma);
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		if (!sucio && !nueva) return avisar({ tipo: 'info', titulo: 'No hay cambios que guardar.' });
		setGuardando(true);
		setError('');
		setConflicto(false);
		try {
			const sha = await guardarNoticia(n, foto?.blob ?? null, original ?? null, datos);
			setTerminado(true);
			protegerSalida(null);
			avisar(
				esDemo()
					? { tipo: 'info', titulo: 'Guardado en la demostración.', texto: 'No se publicó en el sitio.' }
					: n.publicado
						? { tipo: 'ok', titulo: 'Guardado.', texto: 'La noticia quedó publicada. El sitio se actualizará en 1 o 2 minutos.' }
						: { tipo: 'ok', titulo: 'Borrador guardado.', texto: 'No aparece en el sitio hasta que lo publiques.' },
			);
			onGuardado(n.slug, sha);
		} catch (e) {
			setConflicto(e instanceof Conflicto);
			setError(mensajeDeError(e));
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} finally {
			setGuardando(false);
		}
	}

	async function borrar() {
		setGuardando(true);
		setError('');
		try {
			const sha = await borrarNoticia(original!, datos);
			setTerminado(true);
			protegerSalida(null);
			avisar(
				esDemo()
					? { tipo: 'info', titulo: 'Noticia borrada de la demostración.', texto: '«Restablecer demostración» la recupera.' }
					: { tipo: 'ok', titulo: 'Noticia borrada.', texto: 'Se quitará del sitio en 1 o 2 minutos.' },
			);
			onBorrado(sha);
		} catch (e) {
			setConflicto(e instanceof Conflicto);
			setError(mensajeDeError(e));
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} finally {
			setGuardando(false);
		}
	}

	const salir = (destino = '#/noticias') => {
		protegerSalida(null);
		location.hash = destino;
	};

	const copiarMiTexto = async () => {
		const partes = LANGS.flatMap((l) => {
			const x = n.textos[l];
			return estaVacio(x) ? [] : [`[${l.toUpperCase()}]`, x!.titulo, x!.resumen, x!.cuerpo];
		});
		try {
			await navigator.clipboard.writeText(partes.join('\n\n'));
			avisar({ tipo: 'ok', titulo: 'Texto copiado.', texto: 'Pégalo donde lo necesites después de recargar.' });
		} catch {
			avisar({ tipo: 'error', titulo: 'No se pudo copiar.', texto: 'Selecciona el texto y cópialo a mano.' });
		}
	};

	const tituloBorrar = n.textos.es?.titulo || original?.textos.es?.titulo || 'Sin título';
	const portadaVista = foto?.url ?? fotoActual;
	const slugCambiado = !nueva && n.slug !== original!.slug;

	return (
		<>
			<div class={`${contenedor} flex flex-col gap-5 pb-12`}>
				<a
					href="#/noticias"
					onClick={(e) => {
						if (!sucio) return;
						e.preventDefault();
						setSalida('#/noticias');
					}}
					class="inline-flex min-h-11 items-center self-start text-[15px] font-semibold"
				>
					← Noticias
				</a>

				{salida && sucio && (
					<div role="alert" class="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-sm border border-warn bg-warn-bg px-4 py-3.5">
						<span class="flex-[1_1_300px]">
							<strong>Tienes cambios sin guardar.</strong> Si sales ahora, se perderán.
						</span>
						<div class="flex flex-wrap gap-2">
							<Boton variante="secundario" class="bg-card" onClick={() => setSalida(null)} autoFocus>
								Seguir editando
							</Boton>
							<Boton variante="contorno" onClick={() => salir(salida)}>
								Salir sin guardar
							</Boton>
						</div>
					</div>
				)}

				{conflicto && (
					<div role="alert" class="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-sm border border-conflict bg-conflict-bg p-4">
						<div class="flex flex-[1_1_360px] flex-col gap-1">
							<strong class="text-conflict">Otra persona cambió esta noticia mientras la editabas.</strong>
							<span>Para no borrar su trabajo, tus cambios no se guardaron. Copia tu texto si lo necesitas y recarga para ver la versión nueva.</span>
						</div>
						<div class="flex flex-wrap gap-2">
							<Boton variante="secundario" class="border-conflict" onClick={copiarMiTexto}>
								Copiar mi texto
							</Boton>
							<Boton
								onClick={() => {
									protegerSalida(null);
									onRecargar();
								}}
							>
								Recargar
							</Boton>
						</div>
					</div>
				)}

				{error && !conflicto && (
					<Aviso tipo="error">
						<strong>No se guardó.</strong> {error}
					</Aviso>
				)}
				{cuantosErrores > 0 && (
					<Aviso tipo="error">
						<strong>No se guardó.</strong> Revisa {cuantosErrores === 1 ? 'el campo marcado' : `los ${cuantosErrores} campos marcados`} en rojo.
					</Aviso>
				)}

				<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
					<h1 class="m-0 font-serif text-[clamp(32px,3.6vw,46px)] leading-[1.04] font-normal">{nueva ? 'Nueva noticia' : 'Editar noticia'}</h1>
					{n.publicado ? <Insignia tono="ok">Publicada</Insignia> : <Insignia tono="warn">Borrador</Insignia>}
				</div>

				<div class="flex flex-wrap items-start gap-[clamp(20px,3vw,40px)]">
					{/* Textos por idioma */}
					<section aria-label="Textos por idioma" class="flex min-w-0 flex-[999_1_560px] flex-col">
						<div role="tablist" aria-label="Idioma del texto" class="flex border-b-2 border-ink">
							{PESTANAS.map(([l, texto]) => (
								<button
									key={l}
									type="button"
									role="tab"
									id={`tab-${l}`}
									aria-selected={lang === l}
									aria-controls="panel-texto"
									onClick={() => setLang(l)}
									class="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-t-sm border-0 bg-transparent px-5 text-[15px] font-bold tracking-[.04em] text-ink aria-selected:bg-ink aria-selected:text-bg"
								>
									{texto}
									{l === 'en' && faltaIngles && <span class="rounded-pill bg-warn-bg px-[7px] py-0.5 text-xs font-semibold tracking-normal text-warn">falta</span>}
									{lang !== l && conError(l) && <span aria-label="con errores" class="size-2 rounded-full bg-danger" />}
								</button>
							))}
						</div>
						<div id="panel-texto" role="tabpanel" aria-labelledby={`tab-${lang}`} lang={lang} class="flex flex-col gap-[22px] pt-[22px]">
							{lang === 'en' && faltaIngles && (
								<p class="m-0 flex gap-2.5 rounded-sm bg-info-bg px-3.5 py-3 text-[15px] text-ink">
									<strong class="text-info" aria-hidden="true">
										i
									</strong>
									<span>
										Esta noticia aún no tiene texto en inglés. Puedes guardarla igual y completarla después; mientras tanto solo aparece en español.{' '}
										<button
											type="button"
											onClick={() => setTexto('en', { ...(n.textos.es ?? textoVacio()) })}
											class="cursor-pointer border-0 bg-transparent p-0 text-[15px] font-semibold text-forest underline"
										>
											Copiar el texto en español como punto de partida
										</button>
									</span>
								</p>
							)}
							{lang === 'en' && !nueva && original!.shas.en && faltaIngles && (
								<Aviso tipo="warn">Si guardas con el inglés vacío, se borrará la versión en inglés de esta noticia.</Aviso>
							)}

							<label class="flex flex-col gap-1.5">
								<span class={etiquetaCampo}>
									Título
									{lang === 'es' && <Obligatorio />}
								</span>
								<input
									value={t.titulo}
									onInput={(e) => setTexto(lang, { titulo: e.currentTarget.value })}
									aria-invalid={Boolean(err('titulo')) || undefined}
									aria-describedby="e-titulo"
									class={`${campo} min-h-[52px] font-serif text-2xl leading-tight font-medium`}
								/>
								<MensajeError id="e-titulo" texto={err('titulo')} />
							</label>

							<label class="flex flex-col gap-1.5">
								<span class="flex justify-between gap-2">
									<span class={etiquetaCampo}>
										Resumen
										{lang === 'es' && <Obligatorio />}
									</span>
									<span class={`text-[13px] tabular-nums ${t.resumen.trim().length > MAX_RESUMEN ? 'text-danger' : 'text-muted'}`}>
										{t.resumen.trim().length} / {MAX_RESUMEN}
									</span>
								</span>
								<span class={ayudaCampo}>Aparece debajo del título y en la lista de noticias.</span>
								<textarea
									rows={3}
									value={t.resumen}
									onInput={(e) => setTexto(lang, { resumen: e.currentTarget.value })}
									aria-invalid={Boolean(err('resumen')) || undefined}
									aria-describedby="e-resumen"
									class={`${campo} resize-y leading-normal`}
								/>
								<MensajeError id="e-resumen" texto={err('resumen')} />
							</label>

							<label class="flex flex-col gap-1.5">
								<span class={etiquetaCampo}>
									Descripción de la foto (texto alternativo)
									{lang === 'es' && <Obligatorio />}
								</span>
								<span class={ayudaCampo}>Describe lo que se ve en la portada, para quien no puede ver la imagen.</span>
								<input
									value={t.portadaAlt}
									onInput={(e) => setTexto(lang, { portadaAlt: e.currentTarget.value })}
									aria-invalid={Boolean(err('portadaAlt')) || undefined}
									aria-describedby="e-alt"
									class={campo}
								/>
								<MensajeError id="e-alt" texto={err('portadaAlt')} />
							</label>

							<div class="flex flex-col gap-1.5">
								<div class="flex flex-wrap items-end justify-between gap-2">
									<span id="l-cuerpo" class={etiquetaCampo}>
										Texto de la noticia
									</span>
									<div role="group" aria-label="Modo" class="flex rounded-sm border border-line bg-card p-0.5">
										{[false, true].map((v) => (
											<button
												key={String(v)}
												type="button"
												onClick={() => setVista(v)}
												aria-pressed={vista === v}
												class="min-h-10 cursor-pointer rounded-[3px] border-0 bg-transparent px-3.5 text-sm font-semibold text-ink aria-pressed:bg-ink aria-pressed:text-bg"
											>
												{v ? 'Vista previa' : 'Escribir'}
											</button>
										))}
									</div>
								</div>
								{vista ? (
									<article aria-label="Vista previa de la noticia" class="flex flex-col gap-[18px] rounded-sm border border-line bg-bg p-[clamp(20px,4vw,48px)]">
										<span class="text-xs font-semibold tracking-[.14em] text-amber-ink uppercase">{n.etiquetas[0] ? newsTags[n.etiquetas[0]][lang] : 'Noticias'}</span>
										<h2 class="m-0 font-serif text-[clamp(30px,4vw,52px)] leading-[1.04] font-normal tracking-[-.015em] text-balance">{t.titulo || 'Sin título'}</h2>
										{t.resumen && <p class="m-0 font-serif text-[clamp(18px,1.6vw,21px)] text-muted">{t.resumen}</p>}
										{portadaVista && <img src={portadaVista} alt={t.portadaAlt} class="aspect-[3/2] w-full rounded-lg object-cover" />}
										{t.cuerpo.trim() ? (
											<div class="vista-md max-w-[680px] text-[17px] leading-relaxed" dangerouslySetInnerHTML={{ __html: marked.parse(t.cuerpo, { async: false }) }} />
										) : (
											<p class="m-0 text-muted">Todavía no hay texto.</p>
										)}
									</article>
								) : (
									<>
										<div class="overflow-hidden rounded-sm border border-line bg-card">
											<div role="toolbar" aria-label="Formato" class="flex flex-wrap gap-0.5 border-b border-line bg-surface p-1">
												{herramientas.map(([texto, titulo, letra, accion]) => (
													<button
														key={titulo}
														type="button"
														onClick={accion}
														title={titulo}
														aria-label={titulo}
														class={`min-h-10 min-w-11 cursor-pointer rounded-[3px] border-0 bg-transparent px-2.5 text-ink hover:bg-card ${letra}`}
													>
														{texto}
													</button>
												))}
											</div>
											<textarea
												ref={cuerpoRef}
												aria-labelledby="l-cuerpo"
												aria-describedby="a-cuerpo"
												rows={14}
												value={t.cuerpo}
												onInput={(e) => setTexto(lang, { cuerpo: e.currentTarget.value })}
												class="block w-full resize-y border-0 bg-transparent px-3.5 py-3 text-base leading-relaxed text-ink"
											/>
										</div>
										<span id="a-cuerpo" class="text-[13px] text-muted">
											Deja una línea en blanco entre párrafos. **negrita**, *cursiva*, ## subtítulo, - lista.
										</span>
									</>
								)}
							</div>
						</div>
					</section>

					{/* Datos compartidos por ambos idiomas */}
					<aside aria-label="Datos de la noticia" class="flex min-w-0 flex-[1_1_320px] flex-col gap-[22px] rounded-md border border-line bg-card p-5">
						<div class="flex items-center justify-between gap-3 border-b border-line pb-[18px]">
							<span class="flex flex-col gap-0.5">
								<span id="l-pub" class={etiquetaCampo}>
									Mostrar en el sitio
								</span>
								<span class={ayudaCampo}>{n.publicado ? 'Publicada: visible en el sitio.' : 'Borrador: se guarda, pero no aparece en el sitio.'}</span>
							</span>
							<button
								type="button"
								role="switch"
								aria-checked={n.publicado}
								aria-labelledby="l-pub"
								onClick={() => set({ publicado: !n.publicado })}
								class={`relative h-8 w-14 flex-none cursor-pointer rounded-pill border-0 ${n.publicado ? 'bg-ok' : 'bg-line'}`}
							>
								<span class={`absolute top-1 size-6 rounded-full bg-card transition-[left] duration-150 motion-reduce:transition-none ${n.publicado ? 'left-7' : 'left-1'}`} />
							</button>
						</div>

						<label class="flex flex-col gap-1.5">
							<span class={etiquetaCampo}>Dirección de la página</span>
							<span class={`flex overflow-hidden rounded-sm border bg-bg ${errores.slug ? 'border-danger' : 'border-line'}`}>
								<span class="flex items-center pl-3 text-[15px] text-muted">/noticias/</span>
								<input
									value={n.slug}
									onInput={(e) => {
										setSlugTocado(true);
										set({ slug: e.currentTarget.value });
									}}
									onBlur={(e) => set({ slug: slugDe(e.currentTarget.value) })}
									aria-invalid={Boolean(errores.slug) || undefined}
									aria-describedby="e-slug a-slug"
									class="min-h-11 min-w-0 flex-1 border-0 bg-transparent py-2 pr-3 pl-0.5 font-mono text-[15px] text-ink"
								/>
							</span>
							<MensajeError id="e-slug" texto={errores.slug} />
							<span id="a-slug" class="text-[13px] text-muted">
								{nueva
									? 'Se escribe sola a partir del título en español. Solo minúsculas, números y guiones.'
									: 'Solo minúsculas, números y guiones. Cambiarla rompe los enlaces ya compartidos.'}
							</span>
							{slugCambiado && !errores.slug && <span class="text-[13px] font-semibold text-warn">Al guardar, la noticia pasará a /noticias/{n.slug}/.</span>}
						</label>

						<label class="flex flex-col gap-1.5">
							<span class={etiquetaCampo}>Fecha</span>
							<input
								type="date"
								value={n.fecha}
								onInput={(e) => set({ fecha: e.currentTarget.value })}
								aria-invalid={Boolean(errores.fecha) || undefined}
								aria-describedby="e-fecha"
								class={`${campo} bg-bg`}
							/>
							<MensajeError id="e-fecha" texto={errores.fecha} />
						</label>

						<fieldset class="m-0 flex flex-col gap-2 border-0 p-0" aria-describedby="e-etq">
							<legend class={`mb-2 p-0 ${etiquetaCampo}`}>Etiquetas</legend>
							<div class="flex flex-wrap gap-1.5">
								{newsTagIds.map((id) => {
									const on = n.etiquetas.includes(id);
									return (
										<button
											key={id}
											type="button"
											aria-pressed={on}
											onClick={() => set({ etiquetas: on ? n.etiquetas.filter((x) => x !== id) : [...n.etiquetas, id] })}
											class="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-transparent px-3 text-sm font-semibold text-ink aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-on-forest"
										>
											{on && '✓ '}
											{newsTags[id].es}
										</button>
									);
								})}
							</div>
							<MensajeError id="e-etq" texto={errores.etiquetas} />
						</fieldset>

						<SelectorFoto
							id="portada"
							etiqueta="Foto de portada"
							src={portadaVista}
							proporcion="3/2"
							textoPendiente="Toda noticia necesita una foto de portada. Elige una horizontal."
							error={errores.portada}
							onFoto={setFoto}
						/>
					</aside>
				</div>
			</div>

			<BarraGuardar
				sucio={sucio}
				nuevo={nueva}
				guardando={guardando}
				primario={n.publicado ? 'Guardar y publicar' : 'Guardar borrador'}
				borrar={nueva ? undefined : 'Borrar noticia'}
				borrarPregunta="¿Borrar esta noticia?"
				borrarTexto={`«${tituloBorrar}» se quitará del sitio en la próxima publicación, en español y en inglés. No se puede deshacer desde el panel.`}
				nota={faltaIngles ? 'Falta el texto en inglés' : undefined}
				onPrimario={guardar}
				onCancelar={() => salir()}
				onBorrar={borrar}
			/>
		</>
	);
}
