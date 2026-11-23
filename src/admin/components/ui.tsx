/** Piezas de interfaz compartidas del panel (diseno/Panel-Componentes.dc.html). */
import type { ButtonHTMLAttributes, ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { leerBlob } from '../lib/github';
import { rutaPortada } from '../lib/noticias';

/** Contenedor de cada pantalla: 1280 px como máximo, con márgenes fluidos. */
export const contenedor = 'mx-auto w-full max-w-[1280px] px-[clamp(16px,3vw,40px)]';

/** Campo de texto: 44 px de alto como mínimo, radio de 4 px, fondo de tarjeta. */
export const campo =
	'w-full min-h-11 rounded-sm border border-line bg-card px-3 py-2 text-base text-ink aria-invalid:border-danger';

export const etiquetaCampo = 'text-[14.5px] font-semibold';
export const ayudaCampo = 'text-[13.5px] text-muted';

type Variante = 'primario' | 'contorno' | 'secundario' | 'texto-peligro' | 'peligro';

const VARIANTES: Record<Variante, string> = {
	primario: 'border-transparent bg-btn text-btn-ink hover:text-btn-ink hover:brightness-110',
	contorno: 'border-ink bg-transparent text-ink hover:bg-surface hover:text-ink',
	secundario: 'border-line bg-transparent text-ink hover:border-ink hover:text-ink',
	'texto-peligro': 'border-transparent bg-transparent text-danger hover:bg-danger-bg hover:text-danger',
	peligro: 'border-transparent bg-danger-btn text-danger-btn-ink hover:brightness-110',
};

/** Clases de botón (también sirven para enlaces con aspecto de botón). */
export const claseBoton = (variante: Variante = 'primario', cls = '') =>
	`inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border px-4 text-[15px] font-semibold no-underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${cls}`;

export function Boton({
	variante = 'primario',
	class: cls = '',
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
	return <button type="button" {...props} class={claseBoton(variante, String(cls))} />;
}

export function Girando({ class: cls = 'size-4' }: { class?: string }) {
	return <span aria-hidden="true" class={`inline-block flex-none animate-pspin rounded-full border-2 border-current border-r-transparent ${cls}`} />;
}

export type Tono = 'ok' | 'warn' | 'danger' | 'neutral' | 'info';

const TONOS: Record<Tono, string> = {
	ok: 'bg-ok-bg text-ok',
	warn: 'bg-warn-bg text-warn',
	danger: 'bg-danger-bg text-danger',
	neutral: 'bg-neutral-bg text-neutral',
	info: 'bg-info-bg text-info',
};

/** Insignia de estado con punto (Publicada, Borrador, Listo…). */
export function Insignia({ tono, children, class: cls = '' }: { tono: Tono; children: ComponentChildren; class?: string }) {
	return (
		<span class={`inline-flex flex-none items-center gap-1.5 rounded-pill px-2.5 py-[3px] text-[12.5px] font-semibold ${TONOS[tono]} ${cls}`}>
			<span aria-hidden="true" class="size-[7px] rounded-full bg-current" />
			{children}
		</span>
	);
}

export type TipoAviso = 'error' | 'ok' | 'info' | 'warn' | 'conflicto';

const AVISOS: Record<TipoAviso, { caja: string; marca: string; glifo: string }> = {
	error: { caja: 'border-danger bg-danger-bg', marca: 'text-danger', glifo: '!' },
	ok: { caja: 'border-ok bg-ok-bg', marca: 'text-ok', glifo: '✓' },
	info: { caja: 'border-transparent bg-info-bg', marca: 'text-info', glifo: 'i' },
	warn: { caja: 'border-warn bg-warn-bg', marca: 'text-warn', glifo: 'i' },
	conflicto: { caja: 'border-conflict bg-conflict-bg', marca: 'text-conflict', glifo: '!' },
};

/** Aviso en la página (no flotante). */
export function Aviso({ tipo, children, class: cls = '' }: { tipo: TipoAviso; children: ComponentChildren; class?: string }) {
	const a = AVISOS[tipo];
	return (
		<div role={tipo === 'error' || tipo === 'conflicto' ? 'alert' : 'status'} class={`flex gap-2.5 rounded-sm border px-3.5 py-3 text-[15px] ${a.caja} ${cls}`}>
			<strong aria-hidden="true" class={a.marca}>
				{a.glifo}
			</strong>
			<div class="min-w-0 flex-1">{children}</div>
		</div>
	);
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
	return (
		<p role="status" class="m-0 flex items-center gap-2 text-muted">
			<Girando />
			{texto}
		</p>
	);
}

/** Bloque gris de esqueleto de carga. */
export const Esqueleto = ({ class: cls, ancho }: { class: string; ancho?: string }) => (
	<span aria-hidden="true" class={`block rounded-[2px] bg-skel ${cls}`} style={ancho ? { width: ancho } : undefined} />
);

// ---------- Avisos flotantes (guardado, error…) ----------

export interface AvisoFlotante {
	tipo: TipoAviso;
	titulo: string;
	texto?: string;
}

type Oyente = (a: AvisoFlotante & { id: number }) => void;
const oyentes = new Set<Oyente>();
let siguiente = 0;

/** Muestra un aviso flotante (lo dibuja <AvisosFlotantes /> en el marco del panel). */
export function avisar(a: AvisoFlotante) {
	const conId = { ...a, id: ++siguiente };
	oyentes.forEach((o) => o(conId));
}

export function AvisosFlotantes() {
	const [lista, setLista] = useState<(AvisoFlotante & { id: number })[]>([]);
	useEffect(() => {
		const timers: ReturnType<typeof setTimeout>[] = [];
		const oir: Oyente = (a) => {
			setLista((l) => [...l, a].slice(-3));
			// Los errores se quedan hasta que se cierran
			if (a.tipo !== 'error' && a.tipo !== 'conflicto') timers.push(setTimeout(() => cerrar(a.id), 6000));
		};
		oyentes.add(oir);
		return () => {
			oyentes.delete(oir);
			timers.forEach(clearTimeout);
		};
	}, []);
	const cerrar = (id: number) => setLista((l) => l.filter((x) => x.id !== id));
	const COLOR: Record<TipoAviso, string> = {
		ok: 'border-ok bg-card [--c:var(--ok)]',
		error: 'border-danger bg-danger-bg [--c:var(--danger)]',
		info: 'border-info bg-card [--c:var(--info)]',
		warn: 'border-warn bg-card [--c:var(--warn)]',
		conflicto: 'border-conflict bg-conflict-bg [--c:var(--conflict)]',
	};
	return (
		<div
			aria-live="polite"
			aria-relevant="additions"
			class="pointer-events-none fixed top-[76px] right-[clamp(12px,3vw,32px)] z-60 flex w-[min(400px,calc(100vw-24px))] flex-col gap-2"
		>
			{lista.map((a) => (
				<div
					key={a.id}
					role={a.tipo === 'error' || a.tipo === 'conflicto' ? 'alert' : 'status'}
					class={`pointer-events-auto flex items-start gap-3 rounded-md border py-3 pr-2 pl-3.5 text-[15px] text-ink shadow-[0_8px_24px_rgba(0,0,0,.14)] ${COLOR[a.tipo]}`}
				>
					<span aria-hidden="true" class="mt-px flex size-[22px] flex-none items-center justify-center rounded-full bg-(--c) text-[13px] font-bold text-card">
						{AVISOS[a.tipo].glifo}
					</span>
					<span class="flex-1 pt-px">
						<strong>{a.titulo}</strong> {a.texto}
					</span>
					<button
						type="button"
						onClick={() => cerrar(a.id)}
						aria-label="Cerrar aviso"
						class="-mt-1.5 size-9 flex-none cursor-pointer border-0 bg-transparent text-xl text-ink"
					>
						×
					</button>
				</div>
			))}
		</div>
	);
}

// ---------- Imágenes del repositorio ----------

// Se piden una vez por sha y se guardan como URL de objeto
const cache = new Map<string, Promise<string>>();

/** URL de una imagen del repositorio por su ruta (null mientras carga o si no existe). */
export function useFotoRepo(path: string, archivos: Map<string, string>): string | null {
	const [url, setUrl] = useState<string | null>(null);
	useEffect(() => {
		const sha = path ? archivos.get(path) : undefined;
		if (!sha) return setUrl(null);
		const tipo = path.endsWith('.webp') ? 'image/webp' : path.endsWith('.png') ? 'image/png' : 'image/jpeg';
		if (!cache.has(sha)) cache.set(sha, leerBlob(sha, tipo).then((b) => URL.createObjectURL(b)));
		let vivo = true;
		cache.get(sha)!.then((u) => vivo && setUrl(u)).catch(() => vivo && setUrl(null));
		return () => {
			vivo = false;
		};
	}, [path, archivos]);
	return url;
}

/** URL de una portada de noticia (escrita como en el .md). */
export const usePortadaRepo = (portada: string, archivos: Map<string, string>) => useFotoRepo(portada ? rutaPortada(portada) : '', archivos);

/** Muestra una portada guardada en el repositorio. */
export function PortadaRepo({ portada, archivos, class: cls = '' }: { portada: string; archivos: Map<string, string>; class?: string }) {
	const url = usePortadaRepo(portada, archivos);
	return url ? <img src={url} alt="" class={`object-cover ${cls}`} /> : <div class={`bg-skel ${cls}`} aria-hidden="true" />;
}
