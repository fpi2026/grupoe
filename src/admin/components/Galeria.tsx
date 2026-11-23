/**
 * Galería (diseno/Panel-Galeria.dc.html): fotos de src/content/datos/galeria.json.
 * Arrastrar y soltar (o elegir) varias fotos a la vez: se reducen a 1600 px y WebP en el
 * navegador y se suben al guardar, junto con el JSON, en un solo commit.
 * Cuadrícula con filtros por categoría; la foto elegida se edita en el panel lateral.
 */
import { useRef, useState } from 'preact/hooks';
import { categories, type CategoryId } from '../../data/galeria';
import { conClave, rutaFotoNueva, useDocumento, type EstadoDocumento } from '../lib/documento';
import { comprimirImagen, tamano } from '../lib/imagen';
import type { Repo } from '../lib/noticias';
import { Campo, CampoBilingue, ConfirmarBorrado, PantallaDocumento, mover, useFotoDocumento, useOrdenable, type Bilingue } from './formulario';
import { Boton, campo, claseBoton } from './ui';

interface Foto {
	_k: string;
	foto: string;
	categoria: CategoryId;
	alt: Bilingue;
}
interface Datos {
	fotos: Foto[];
}

/** Archivo en preparación (reducción a WebP). */
interface EnCola {
	id: string;
	nombre: string;
	etapa: 'reduciendo' | 'lista' | 'error';
	info: string;
	miniatura: string;
}

const CATEGORIAS = categories.filter((c) => c.id !== 'all') as { id: CategoryId; es: string }[];
const nombreCategoria = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.es])) as Record<CategoryId, string>;
const incompleta = (f: Foto) => !f.alt.es.trim() || !f.alt.en.trim();
type Filtro = 'todas' | 'falta' | CategoryId;

export function Galeria({ repo, onGuardado }: { repo: Repo | null; onGuardado: (sha: string) => void }) {
	const doc = useDocumento<Datos>('galeria.json', repo, (d) => ({ ...d, fotos: d.fotos.map(conClave) }));
	const [filtro, setFiltro] = useState<Filtro>('todas');
	const [elegida, setElegida] = useState<string | null>(null);
	const [cola, setCola] = useState<EnCola[]>([]);
	const [encima, setEncima] = useState(false);
	const [anuncio, setAnuncio] = useState('');
	const detalle = useRef<HTMLElement>(null);

	const fotos = doc.datos?.fotos ?? [];
	const setFotos = (f: (a: Foto[]) => Foto[]) => doc.setDatos((d) => ({ ...d, fotos: f(d.fotos) }));
	const orden = useOrdenable(fotos, (a) => setFotos(() => a), (x) => x.alt.es || 'foto sin descripción');

	const errores: Record<string, string> = {};
	for (const f of fotos) if (!f.alt.es.trim()) errores[`${f._k}.alt`] = 'Escribe la descripción en español.';

	const faltan = fotos.filter(incompleta).length;
	const filtroActivo: Filtro = filtro === 'falta' && !faltan ? 'todas' : filtro;
	const visibles = fotos.map((f, i) => ({ f, i })).filter(({ f }) => filtroActivo === 'todas' || (filtroActivo === 'falta' ? incompleta(f) : f.categoria === filtroActivo));
	const iSel = fotos.findIndex((f) => f._k === elegida);
	const sel = iSel >= 0 ? fotos[iSel]! : null;

	const editar = (k: string, c: Partial<Foto>) => setFotos((a) => a.map((f) => (f._k === k ? { ...f, ...c } : f)));
	const actualizarCola = (id: string, c: Partial<EnCola>) => setCola((q) => q.map((x) => (x.id === id ? { ...x, ...c } : x)));

	async function preparar(archivo: File) {
		const id = Math.random().toString(36).slice(2);
		setCola((q) => [...q, { id, nombre: archivo.name, etapa: 'reduciendo', info: `Original: ${tamano(archivo.size)}`, miniatura: '' }]);
		try {
			const r = await comprimirImagen(archivo);
			const url = URL.createObjectURL(r.blob);
			const ruta = rutaFotoNueva('galeria');
			doc.agregarFoto(ruta, r.blob, url);
			// Nueva al inicio, con la categoría del filtro si hay uno elegido
			const categoria: CategoryId = filtro !== 'todas' && filtro !== 'falta' ? filtro : 'cabanas';
			const nueva = conClave({ foto: ruta, categoria, alt: { es: '', en: '' } });
			setFotos((a) => [nueva, ...a]);
			setElegida(nueva._k);
			actualizarCola(id, { etapa: 'lista', miniatura: url, info: `${r.ancho} × ${r.alto} px · WebP · ${tamano(r.blob.size)} (antes ${tamano(archivo.size)})` });
			setAnuncio(`${archivo.name} lista. Falta su descripción.`);
		} catch (e) {
			actualizarCola(id, { etapa: 'error', info: e instanceof Error && e.message ? e.message : 'No se pudo leer este archivo. Prueba con una foto JPG o PNG.' });
		}
	}

	function recibir(lista: FileList | null | undefined) {
		const archivos = Array.from(lista ?? []);
		const imagenes = archivos.filter((f) => f.type.startsWith('image/'));
		if (imagenes.length < archivos.length) setAnuncio('Se ignoraron los archivos que no son imágenes.');
		imagenes.forEach(preparar);
	}

	function elegir(k: string) {
		setElegida(k);
		// En pantallas angostas el panel queda debajo: llevar la vista hasta él
		if (innerWidth < 820 && detalle.current) window.scrollTo({ top: detalle.current.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' });
	}

	const enPreparacion = cola.filter((q) => q.etapa === 'reduciendo').length;

	return (
		<PantallaDocumento
			titulo="Galería"
			accion={doc.datos && <span class="pb-1 text-muted">{fotos.length === 1 ? '1 foto' : `${fotos.length} fotos`}</span>}
			doc={doc}
			errores={errores}
			mensaje="CMS: Actualiza la galería"
			onGuardado={onGuardado}
		>
			{(error) => (
				<>
					<p aria-live="polite" class="sr-only">
						{anuncio}
					</p>
					{orden.anuncio}

					{faltan > 0 && (
						<div role="status" class="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-sm border border-warn bg-warn-bg px-4 py-3">
							<span class="flex-[1_1_320px]">
								<strong>{faltan === 1 ? '1 foto no tiene descripción completa.' : `${faltan} fotos no tienen descripción completa.`}</strong> Sin descripción, quien usa
								lector de pantalla no sabe qué muestra la foto.
							</span>
							<Boton variante="secundario" class="border-warn bg-card" onClick={() => setFiltro('falta')}>
								Ver fotos sin descripción
							</Boton>
						</div>
					)}

					<section aria-labelledby="up-t" class="flex flex-col gap-3">
						<h2 id="up-t" class="sr-only">
							Subir fotos
						</h2>
						<label
							onDragOver={(e) => {
								e.preventDefault();
								setEncima(true);
							}}
							onDragLeave={() => setEncima(false)}
							onDrop={(e) => {
								e.preventDefault();
								setEncima(false);
								recibir(e.dataTransfer?.files);
							}}
							class={`relative flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-4 rounded-md border-2 border-dashed p-[clamp(24px,4vw,44px)] focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-amber hover:bg-surface ${encima ? 'border-forest bg-ok-bg' : 'border-line bg-card'}`}
						>
							<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" class="flex-none text-forest">
								<path d="M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
							</svg>
							<span class="flex flex-[1_1_280px] flex-col gap-1">
								<strong class="font-serif text-[clamp(22px,2.2vw,28px)] font-medium">Arrastra fotos aquí o elígelas</strong>
								<span class="text-[15px] text-muted">
									Desde el celular puedes elegir de tu galería o tomar una foto. Se reducen a 1600 px y WebP para que pesen poco, y se suben al guardar.
								</span>
							</span>
							<span class={claseBoton('primario', 'pointer-events-none min-h-12 px-5')}>Elegir fotos</span>
							<input
								type="file"
								accept="image/*"
								multiple
								aria-label="Elegir fotos para subir"
								onChange={(e) => {
									recibir(e.currentTarget.files);
									e.currentTarget.value = '';
								}}
								class="absolute inset-0 w-full cursor-pointer opacity-0"
							/>
						</label>

						{cola.length > 0 && (
							<div class="flex flex-col rounded-md border border-line bg-card">
								<div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 py-2.5 text-sm">
									<strong>
										{enPreparacion
											? `Preparando ${enPreparacion === 1 ? '1 foto' : `${enPreparacion} fotos`}…`
											: 'Fotos listas. Escribe su descripción y pulsa «Guardar cambios» para subirlas.'}
									</strong>
									{!enPreparacion && (
										<Boton variante="secundario" class="min-h-9 text-sm" onClick={() => setCola([])}>
											Ocultar lista
										</Boton>
									)}
								</div>
								<ul class="m-0 list-none p-0">
									{cola.map((q) => (
										<li key={q.id} class="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-line px-3.5 py-2.5 last:border-b-0">
											{q.miniatura ? (
												<img src={q.miniatura} alt="" class="h-[42px] w-14 flex-none rounded-[3px] object-cover" />
											) : (
												<span class="h-[42px] w-14 flex-none rounded-[3px] bg-skel" />
											)}
											<div class="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
												<div class="flex justify-between gap-2 text-[14.5px]">
													<span class="truncate font-semibold">{q.nombre}</span>
													<span class={`font-semibold whitespace-nowrap ${q.etapa === 'lista' ? 'text-ok' : q.etapa === 'error' ? 'text-danger' : 'text-warn'}`}>
														{q.etapa === 'lista' ? 'Lista' : q.etapa === 'error' ? 'Falló' : 'Reduciendo…'}
													</span>
												</div>
												<span class="text-[13px] text-muted">{q.info}</span>
											</div>
										</li>
									))}
								</ul>
							</div>
						)}
					</section>

					<div role="group" aria-label="Filtrar por categoría" class="flex flex-wrap gap-1.5 border-b-2 border-ink pb-3.5">
						{[{ id: 'todas' as Filtro, es: 'Todas' }, ...CATEGORIAS].map((c) => {
							const on = filtroActivo === c.id;
							const n = c.id === 'todas' ? fotos.length : fotos.filter((f) => f.categoria === c.id).length;
							return (
								<button
									key={c.id}
									type="button"
									aria-pressed={on}
									onClick={() => setFiltro(c.id)}
									class={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-pill border px-3.5 text-sm font-semibold ${on ? 'border-ink bg-ink text-bg' : 'border-line bg-transparent text-ink'}`}
								>
									{c.es}
									<span class="font-medium opacity-80">{n}</span>
								</button>
							);
						})}
						{faltan > 0 && (
							<button
								type="button"
								aria-pressed={filtroActivo === 'falta'}
								onClick={() => setFiltro('falta')}
								class={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-pill border border-warn px-3.5 text-sm font-semibold ${filtroActivo === 'falta' ? 'bg-warn text-card' : 'bg-warn-bg text-warn'}`}
							>
								Sin descripción<span class="font-medium opacity-80">{faltan}</span>
							</button>
						)}
					</div>

					<div class="flex flex-wrap items-start gap-6">
						<ul class="m-0 grid min-w-0 flex-[999_1_520px] list-none grid-cols-[repeat(auto-fill,minmax(min(46%,160px),1fr))] gap-2.5 p-0">
							{visibles.map(({ f, i }) => (
								<Miniatura
									key={f._k}
									f={f}
									n={i + 1}
									elegida={f._k === elegida}
									conError={Boolean(error(`${f._k}.alt`))}
									doc={doc}
									repo={repo!}
									arrastre={orden.arrastre(i)}
									onElegir={() => elegir(f._k)}
								/>
							))}
							{visibles.length === 0 && <li class="col-span-full py-8 text-muted">No hay fotos en esta categoría todavía.</li>}
						</ul>

						<aside
							ref={detalle}
							aria-label="Foto seleccionada"
							class="sticky top-[120px] flex min-w-0 flex-[1_1_320px] flex-col gap-[18px] rounded-md border border-line bg-card p-[18px]"
						>
							{sel ? (
								<Detalle
									key={sel._k}
									f={sel}
									pos={iSel + 1}
									total={fotos.length}
									doc={doc}
									repo={repo!}
									error={error(`${sel._k}.alt`)}
									onCambio={(c) => editar(sel._k, c)}
									onMover={(j) => {
										setFotos((a) => mover(a, iSel, j));
										setAnuncio(`Foto movida a la posición ${j + 1} de ${fotos.length}.`);
									}}
									onBorrar={() => {
										setFotos((a) => a.filter((x) => x._k !== sel._k));
										setElegida(null);
										setAnuncio('Foto quitada de la galería.');
									}}
								/>
							) : (
								<p class="m-0 text-muted">Elige una foto para cambiar su categoría, descripción u orden. También puedes arrastrarlas en la cuadrícula para ordenarlas.</p>
							)}
						</aside>
					</div>
				</>
			)}
		</PantallaDocumento>
	);
}

function Miniatura(p: {
	f: Foto;
	n: number;
	elegida: boolean;
	conError: boolean;
	doc: EstadoDocumento<Datos>;
	repo: Repo;
	arrastre: Record<string, unknown>;
	onElegir: () => void;
}) {
	const src = useFotoDocumento(p.f.foto, p.doc, p.repo);
	const anillo = p.elegida ? 'outline-amber' : p.conError ? 'outline-danger' : 'outline-transparent';
	return (
		<li {...p.arrastre}>
			<button
				type="button"
				onClick={p.onElegir}
				aria-pressed={p.elegida}
				aria-label={`Foto ${p.n}: ${p.f.alt.es || 'sin descripción'} (${nombreCategoria[p.f.categoria]})`}
				class={`relative block w-full cursor-pointer rounded-sm border-0 bg-transparent p-0 outline-3 outline-offset-2 ${anillo}`}
			>
				{src ? (
					<img src={src} alt="" loading="lazy" draggable={false} class="aspect-square w-full rounded-sm object-cover" />
				) : (
					<span class="block aspect-square w-full rounded-sm bg-skel" />
				)}
				<span class="absolute top-1.5 left-1.5 rounded-[3px] bg-bg px-[7px] py-px text-xs font-bold text-ink">{p.n}</span>
				{incompleta(p.f) && (
					<span class="absolute right-1.5 bottom-1.5 left-1.5 rounded-[3px] bg-warn-bg px-2 py-[3px] text-left text-xs font-bold text-warn">
						{p.f.alt.es.trim() ? 'Falta inglés' : 'Sin descripción'}
					</span>
				)}
			</button>
		</li>
	);
}

function Detalle(p: {
	f: Foto;
	pos: number;
	total: number;
	doc: EstadoDocumento<Datos>;
	repo: Repo;
	error?: string;
	onCambio: (c: Partial<Foto>) => void;
	onMover: (j: number) => void;
	onBorrar: () => void;
}) {
	const src = useFotoDocumento(p.f.foto, p.doc, p.repo);
	const [borrando, setBorrando] = useState(false);
	const flecha = 'min-h-11 cursor-pointer rounded-sm border border-line bg-transparent px-2.5 text-sm font-semibold text-ink disabled:cursor-default disabled:opacity-35';
	return (
		<>
			{src ? <img src={src} alt="" class="aspect-[4/3] w-full rounded-sm object-cover" /> : <span class="block aspect-[4/3] w-full rounded-sm bg-skel" />}
			<Campo etiqueta="Categoría">
				<select value={p.f.categoria} onChange={(e) => p.onCambio({ categoria: e.currentTarget.value as CategoryId })} class={campo}>
					{CATEGORIAS.map((c) => (
						<option key={c.id} value={c.id}>
							{c.es}
						</option>
					))}
				</select>
			</Campo>
			<CampoBilingue
				etiqueta="Descripción"
				requerido
				pestanas
				multilinea
				filas={3}
				ayuda="Describe lo que se ve. Escríbela en los dos idiomas."
				valor={p.f.alt}
				onCambio={(v) => p.onCambio({ alt: v })}
				error={p.error}
			/>
			<div class="flex flex-wrap items-center justify-between gap-2">
				<span class="text-[14.5px]">
					<strong>Orden:</strong> {p.pos} de {p.total}
				</span>
				<div class="flex gap-1">
					<button type="button" onClick={() => p.onMover(p.pos - 2)} disabled={p.pos === 1} aria-label="Mover antes" class={flecha}>
						← Antes
					</button>
					<button type="button" onClick={() => p.onMover(p.pos)} disabled={p.pos === p.total} aria-label="Mover después" class={flecha}>
						Después →
					</button>
				</div>
			</div>
			{borrando ? (
				<ConfirmarBorrado pregunta="¿Quitar esta foto?" texto="Dejará de aparecer en la galería cuando guardes." onNo={() => setBorrando(false)} onSi={p.onBorrar} />
			) : (
				<Boton variante="texto-peligro" class="self-start" onClick={() => setBorrando(true)}>
					Quitar foto
				</Boton>
			)}
		</>
	);
}
