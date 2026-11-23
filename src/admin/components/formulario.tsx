/**
 * Piezas comunes de las pantallas que editan un JSON (diseno/Panel-Componentes.dc.html):
 * campo bilingüe, lista ordenable, foto de un documento y la pantalla con su barra de guardar.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { esDemo } from '../lib/demo';
import { conClave, rutaFotoNueva, rutaFotoRepo, type EstadoDocumento } from '../lib/documento';
import type { Repo } from '../lib/noticias';
import { protegerSalida } from '../lib/salida';
import { BarraGuardar } from './BarraGuardar';
import { SelectorFoto } from './SelectorFoto';
import { Aviso, Boton, Cargando, avisar, ayudaCampo, contenedor, etiquetaCampo, useFotoRepo } from './ui';

export interface Bilingue {
	es: string;
	en: string;
}

// ---------- Campo bilingüe ----------

interface CampoBilingueProps {
	etiqueta: string;
	valor: Bilingue;
	onCambio: (v: Bilingue) => void;
	requerido?: boolean;
	multilinea?: boolean;
	filas?: number;
	ayuda?: string;
	error?: string;
	/** Siempre con pestañas (si no, lado a lado cuando hay espacio). */
	pestanas?: boolean;
	ejemploEs?: string;
}

let siguienteId = 0;

/** ES y EN lado a lado (≥ 520 px de ancho) o en pestañas, con aviso de traducción faltante. */
export function CampoBilingue(p: CampoBilingueProps) {
	const [id] = useState(() => `cb${++siguienteId}`);
	const [tab, setTab] = useState<'es' | 'en'>('es');
	const [angosto, setAngosto] = useState(false);
	const raiz = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!raiz.current || !window.ResizeObserver) return;
		const ro = new ResizeObserver(([e]) => setAngosto(e!.contentRect.width < 520));
		ro.observe(raiz.current);
		return () => ro.disconnect();
	}, []);

	const { es, en } = p.valor;
	const falta = es.trim() && !en.trim() ? 'en' : en.trim() && !es.trim() ? 'es' : null;
	const conPestanas = angosto || p.pestanas;
	const idiomas = (['es', 'en'] as const).filter((l) => !conPestanas || l === tab);

	return (
		<div ref={raiz} role="group" aria-labelledby={`${id}-l`} class="flex min-w-0 flex-col gap-2">
			<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
				<span id={`${id}-l`} class={etiquetaCampo}>
					{p.etiqueta}
					{p.requerido && (
						<>
							<span class="text-danger" aria-hidden="true">
								{' '}
								*
							</span>
							<span class="sr-only"> (obligatorio)</span>
						</>
					)}
				</span>
				{falta && (
					<span class="inline-flex items-center gap-1.5 rounded-pill bg-warn-bg px-[9px] py-0.5 text-[12.5px] font-semibold text-warn">
						<span aria-hidden="true">●</span>Falta {falta === 'en' ? 'inglés' : 'español'}
					</span>
				)}
			</div>
			{p.ayuda && <p class={`-mt-1 mb-0 ${ayudaCampo}`}>{p.ayuda}</p>}
			{conPestanas && (
				<div role="tablist" aria-label="Idioma" class="flex border-b border-line">
					{(['es', 'en'] as const).map((l) => (
						<button
							key={l}
							type="button"
							role="tab"
							aria-selected={tab === l}
							onClick={() => setTab(l)}
							class="-mb-px inline-flex min-h-11 cursor-pointer items-center gap-1.5 border-0 border-b-2 border-transparent bg-transparent px-4 text-sm font-medium text-ink aria-selected:border-amber aria-selected:font-bold"
						>
							{l.toUpperCase()}
							{falta === l && <span aria-label="falta traducción" class="size-2 rounded-full bg-amber" />}
						</button>
					))}
				</div>
			)}
			<div class={`grid gap-3 ${conPestanas ? 'grid-cols-1' : 'grid-cols-2'}`}>
				{idiomas.map((l) => {
					const conError = Boolean(p.error) && l === 'es';
					const props = {
						lang: l,
						value: p.valor[l],
						onInput: (e: Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => p.onCambio({ ...p.valor, [l]: e.currentTarget.value }),
						placeholder: l === 'es' ? (p.ejemploEs ?? '') : falta === 'en' ? 'Escribe la traducción al inglés' : '',
						'aria-invalid': conError || undefined,
						'aria-describedby': conError ? `${id}-e` : undefined,
						'aria-label': conPestanas ? `${p.etiqueta} (${l === 'es' ? 'español' : 'inglés'})` : undefined,
						class: `w-full rounded-sm border bg-card px-3 text-base text-ink ${conError ? 'border-danger' : falta === l ? 'border-dashed border-amber' : 'border-line'} ${p.multilinea ? 'resize-y py-2.5 leading-normal' : 'min-h-11 py-2'}`,
					};
					return (
						<label key={l} class="flex min-w-0 flex-col gap-1.5">
							{!conPestanas && <span class="text-xs font-bold tracking-[.12em] text-muted">{l === 'es' ? 'ESPAÑOL' : 'ENGLISH'}</span>}
							{p.multilinea ? <textarea rows={p.filas ?? 4} {...props} /> : <input {...props} />}
						</label>
					);
				})}
			</div>
			{p.error && (
				<p id={`${id}-e`} class="m-0 flex items-center gap-1.5 text-sm font-semibold text-danger">
					<span aria-hidden="true">!</span>
					{p.error}
				</p>
			)}
		</div>
	);
}

// ---------- Campo simple ----------

export function Campo({
	etiqueta,
	opcional,
	ayuda,
	error,
	children,
	class: cls = '',
}: {
	etiqueta: string;
	opcional?: boolean;
	ayuda?: string;
	error?: string;
	children: ComponentChildren;
	class?: string;
}) {
	return (
		<label class={`flex flex-col gap-1.5 ${cls}`}>
			<span class={etiquetaCampo}>
				{etiqueta}
				{opcional && <span class="font-normal text-muted"> (opcional)</span>}
			</span>
			{ayuda && <span class={ayudaCampo}>{ayuda}</span>}
			{children}
			{error && <span class="text-sm font-semibold text-danger">{error}</span>}
		</label>
	);
}

// ---------- Lista ordenable ----------

/** Mueve un elemento de la posición i a la j. */
export function mover<T>(lista: T[], i: number, j: number): T[] {
	if (j < 0 || j >= lista.length || i === j) return lista;
	const a = [...lista];
	const [x] = a.splice(i, 1);
	a.splice(j, 0, x!);
	return a;
}

/**
 * Orden de una lista: arrastrar (HTML5) y botones ↑/↓ para teclado y celular,
 * con anuncio para lectores de pantalla.
 */
export function useOrdenable<T>(lista: T[], cambiar: (nueva: T[]) => void, nombre: (x: T) => string) {
	const [anuncio, setAnuncio] = useState('');
	const arrastrado = useRef<number | null>(null);
	const mov = (i: number, j: number) => {
		if (j < 0 || j >= lista.length || i === j) return;
		cambiar(mover(lista, i, j));
		setAnuncio(`«${nombre(lista[i]!)}» movido a la posición ${j + 1} de ${lista.length}.`);
	};
	return {
		anuncio: (
			<p aria-live="polite" class="sr-only">
				{anuncio}
			</p>
		),
		/** Atributos para el elemento de la lista (arrastrar y soltar). */
		arrastre: (i: number, activo = true) => ({
			draggable: activo,
			onDragStart: (e: DragEvent) => {
				arrastrado.current = i;
				e.dataTransfer?.setData('text/plain', String(i));
			},
			onDragOver: (e: DragEvent) => e.preventDefault(),
			onDrop: (e: DragEvent) => {
				e.preventDefault();
				if (arrastrado.current !== null) mov(arrastrado.current, i);
				arrastrado.current = null;
			},
		}),
		/** Botones ↑ y ↓. */
		botones: (i: number) => (
			<>
				<button
					type="button"
					onClick={() => mov(i, i - 1)}
					disabled={i === 0}
					aria-label={`Subir «${nombre(lista[i]!)}»`}
					class="size-11 cursor-pointer rounded-sm border border-line bg-transparent text-ink disabled:cursor-default disabled:opacity-35"
				>
					↑
				</button>
				<button
					type="button"
					onClick={() => mov(i, i + 1)}
					disabled={i === lista.length - 1}
					aria-label={`Bajar «${nombre(lista[i]!)}»`}
					class="size-11 cursor-pointer rounded-sm border border-line bg-transparent text-ink disabled:cursor-default disabled:opacity-35"
				>
					↓
				</button>
			</>
		),
	};
}

export const Asa = () => (
	<span aria-hidden="true" title="Arrastra para cambiar el orden" class="w-[18px] cursor-grab text-lg text-muted">
		⠿
	</span>
);

/** Confirmación de borrado en la misma página. */
export function ConfirmarBorrado({ pregunta, texto, onSi, onNo }: { pregunta: string; texto: string; onSi: () => void; onNo: () => void }) {
	return (
		<div role="alert" class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm bg-danger-bg px-3 py-2.5">
			<span class="flex-[1_1_200px]">
				<strong class="text-danger">{pregunta}</strong> {texto}
			</span>
			<Boton variante="secundario" class="bg-card text-sm" onClick={onNo} autoFocus>
				No
			</Boton>
			<Boton variante="peligro" class="text-sm" onClick={onSi}>
				Sí, borrar
			</Boton>
		</div>
	);
}

// ---------- Fotos de un documento ----------

/** URL para mostrar una foto del documento: la recién elegida o la del repositorio. */
export function useFotoDocumento(ruta: string, doc: EstadoDocumento<any>, repo: Repo): string | null {
	const delRepo = useFotoRepo(ruta && !doc.fotos.has(ruta) ? rutaFotoRepo(ruta) : '', repo.archivos);
	return ruta ? (doc.fotos.get(ruta)?.url ?? delRepo) : null;
}

/** Selector de foto que guarda la elección en el documento (se sube al guardar). */
export function FotoDocumento({
	ruta,
	onRuta,
	prefijo,
	doc,
	repo,
	etiqueta = 'Foto',
	proporcion,
	quitable = true,
	error,
	textoPendiente,
	insigniaPendiente,
}: {
	ruta: string;
	onRuta: (r: string) => void;
	prefijo: string;
	doc: EstadoDocumento<any>;
	repo: Repo;
	etiqueta?: string;
	proporcion?: string;
	quitable?: boolean;
	error?: string;
	textoPendiente?: string;
	insigniaPendiente?: string;
}) {
	const src = useFotoDocumento(ruta, doc, repo);
	return (
		<SelectorFoto
			id={`f-${prefijo}`}
			etiqueta={etiqueta}
			src={src}
			proporcion={proporcion}
			error={error}
			textoPendiente={textoPendiente}
			insigniaPendiente={insigniaPendiente}
			onFoto={(f) => {
				const nueva = rutaFotoNueva(prefijo);
				doc.agregarFoto(nueva, f.blob, f.url);
				onRuta(nueva);
			}}
			onQuitar={quitable ? () => onRuta('') : undefined}
		/>
	);
}

// ---------- Pantalla de documento ----------

interface PantallaProps {
	titulo: string;
	/** Texto bajo el título. */
	intro?: ComponentChildren;
	/** Botón o enlace junto al título. */
	accion?: ComponentChildren;
	doc: EstadoDocumento<any>;
	/** Errores actuales por campo (vacío = se puede guardar). Se muestran después del primer intento. */
	errores: Record<string, string>;
	/** Mensaje del commit, por ejemplo «CMS: Actualiza los reconocimientos». */
	mensaje: string;
	onGuardado: (sha: string) => void;
	/** Recibe la función que da el error de un campo (solo después de intentar guardar). */
	children: (error: (campo: string) => string | undefined) => ComponentChildren;
}

/** Título, avisos de error y conflicto, contenido y barra de guardar fija. */
export function PantallaDocumento({ titulo, intro, accion, doc, errores, mensaje, onGuardado, children }: PantallaProps) {
	const [intentado, setIntentado] = useState(false);
	const [terminado, setTerminado] = useState(false);

	// Cambios sin guardar: detener la navegación dentro del panel
	useEffect(() => {
		protegerSalida(
			doc.sucio && !doc.guardando && !terminado
				? () => {
						avisar({ tipo: 'warn', titulo: 'Tienes cambios sin guardar.', texto: 'Guárdalos o pulsa «Cancelar» para descartarlos antes de salir.' });
						return true;
					}
				: null,
		);
		return () => protegerSalida(null);
	}, [doc.sucio, doc.guardando, terminado]);

	async function guardar() {
		setIntentado(true);
		if (Object.keys(errores).length) return window.scrollTo({ top: 0, behavior: 'smooth' });
		if (!doc.sucio) return avisar({ tipo: 'info', titulo: 'No hay cambios que guardar.' });
		const sha = await doc.guardar(mensaje);
		if (!sha) return;
		setTerminado(true);
		protegerSalida(null);
		avisar(
			esDemo()
				? { tipo: 'info', titulo: 'Guardado en la demostración.', texto: 'No se publicó en el sitio.' }
				: { tipo: 'ok', titulo: 'Guardado.', texto: 'El sitio se actualizará en 1 o 2 minutos.' },
		);
		onGuardado(sha);
	}

	const cuantos = Object.keys(errores).length;
	const error = (campo: string) => (intentado ? errores[campo] : undefined);

	return (
		<>
			<div class={`${contenedor} flex flex-col gap-6 pb-12`}>
				<div class="flex flex-wrap items-end justify-between gap-4">
					<h1 class="m-0 font-serif text-[clamp(34px,4vw,52px)] leading-[1.02] font-normal tracking-[-.01em]">{titulo}</h1>
					{accion}
				</div>
				{doc.conflicto && (
					<Aviso tipo="conflicto">
						<strong class="text-conflict">Otra persona cambió esta sección mientras la editabas.</strong> Para no borrar su trabajo, tus cambios no se guardaron.
						Copia lo que necesites y recarga la página para ver la versión nueva.
					</Aviso>
				)}
				{doc.error && !doc.conflicto && (
					<Aviso tipo="error">
						{doc.datos !== undefined && <strong>No se guardó. </strong>}
						{doc.error}
					</Aviso>
				)}
				{intentado && cuantos > 0 && (
					<Aviso tipo="error">
						<strong>No se guardó.</strong> Revisa {cuantos === 1 ? 'el campo marcado' : `los ${cuantos} campos marcados`} en rojo.
					</Aviso>
				)}
				{intro && <div class="m-0 max-w-[640px] text-muted">{intro}</div>}
				{doc.datos === undefined ? doc.error ? null : <Cargando /> : children(error)}
			</div>
			{doc.datos !== undefined && (
				<BarraGuardar
					sucio={doc.sucio}
					guardando={doc.guardando}
					primario="Guardar cambios"
					onPrimario={guardar}
					onCancelar={() => {
						doc.descartar();
						setIntentado(false);
					}}
				/>
			)}
		</>
	);
}

// ---------- Lista de fotos con descripción ----------

export interface FotoConAlt {
	_k: string;
	foto: string;
	alt: Bilingue;
}

/** Fotos ordenables (← →) con su descripción ES/EN, para quitar y agregar. Errores en «<_k>.alt». */
export function ListaFotos({
	fotos,
	onCambio,
	prefijo,
	doc,
	repo,
	error,
	minimo = 0,
}: {
	fotos: FotoConAlt[];
	onCambio: (f: FotoConAlt[]) => void;
	prefijo: string;
	doc: EstadoDocumento<any>;
	repo: Repo;
	error: (campo: string) => string | undefined;
	/** Fotos que deben quedar como mínimo (no se pueden quitar más). */
	minimo?: number;
}) {
	const [nueva, setNueva] = useState(false);
	return (
		<>
			<ol class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4 p-0">
				{fotos.map((f, i) => (
					<TarjetaFoto
						key={f._k}
						f={f}
						i={i}
						total={fotos.length}
						doc={doc}
						repo={repo}
						error={error(`${f._k}.alt`)}
						quitable={fotos.length > minimo}
						onCambio={(c) => onCambio(fotos.map((y) => (y._k === f._k ? { ...y, ...c } : y)))}
						onMover={(j) => onCambio(mover(fotos, i, j))}
						onQuitar={() => onCambio(fotos.filter((y) => y._k !== f._k))}
					/>
				))}
			</ol>
			{nueva ? (
				<div class="max-w-[320px] rounded-sm border border-line bg-card p-4">
					<SelectorFoto
						id={`nueva-${prefijo}`}
						etiqueta="Nueva foto"
						src={null}
						insigniaPendiente="Elige una foto"
						textoPendiente="Elige una foto horizontal. Después escribe su descripción."
						onFoto={(x) => {
							const ruta = rutaFotoNueva(prefijo);
							doc.agregarFoto(ruta, x.blob, x.url);
							onCambio([...fotos, conClave({ foto: ruta, alt: { es: '', en: '' } })]);
							setNueva(false);
						}}
					/>
				</div>
			) : (
				<Boton variante="contorno" class="self-start" onClick={() => setNueva(true)}>
					+ Agregar foto
				</Boton>
			)}
		</>
	);
}

function TarjetaFoto(p: {
	f: FotoConAlt;
	i: number;
	total: number;
	doc: EstadoDocumento<any>;
	repo: Repo;
	error?: string;
	quitable: boolean;
	onCambio: (c: Partial<FotoConAlt>) => void;
	onMover: (j: number) => void;
	onQuitar: () => void;
}) {
	const src = useFotoDocumento(p.f.foto, p.doc, p.repo);
	const [quitando, setQuitando] = useState(false);
	const nombre = p.f.alt.es || `foto ${p.i + 1}`;
	const flecha = 'size-11 cursor-pointer rounded-sm border border-line bg-transparent text-ink disabled:cursor-default disabled:opacity-35';
	return (
		<li class="flex flex-col gap-3 rounded-md border border-line bg-card p-3">
			<div class="relative aspect-[4/3] overflow-hidden rounded-sm bg-skel">
				{src && <img src={src} alt={p.f.alt.es} class="size-full object-cover" />}
				<span class="absolute top-2 left-2 rounded-pill bg-ink px-2 py-0.5 text-xs font-bold text-bg">{p.i + 1}</span>
			</div>
			<CampoBilingue etiqueta="Descripción de la foto" requerido multilinea filas={3} pestanas valor={p.f.alt} onCambio={(v) => p.onCambio({ alt: v })} error={p.error} />
			<div class="flex flex-wrap items-center gap-1.5">
				<button type="button" onClick={() => p.onMover(p.i - 1)} disabled={p.i === 0} aria-label={`Mover «${nombre}» antes`} class={flecha}>
					←
				</button>
				<button type="button" onClick={() => p.onMover(p.i + 1)} disabled={p.i === p.total - 1} aria-label={`Mover «${nombre}» después`} class={flecha}>
					→
				</button>
				{p.quitable && (
					<Boton variante="texto-peligro" class="ml-auto" onClick={() => setQuitando(true)}>
						Quitar
					</Boton>
				)}
			</div>
			{quitando && <ConfirmarBorrado pregunta="¿Quitar esta foto?" texto="Dejará de aparecer en la página cuando guardes." onNo={() => setQuitando(false)} onSi={p.onQuitar} />}
		</li>
	);
}
