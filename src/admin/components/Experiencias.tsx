/**
 * Experiencias (diseno/Panel-Experiencias.dc.html): aviso general, lista ordenable y formulario
 * de cada experiencia en un panel lateral. Archivo: src/content/datos/experiencias.json.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { conClave, useDocumento, type EstadoDocumento } from '../lib/documento';
import type { Repo } from '../lib/noticias';
import { Asa, Campo, CampoBilingue, ConfirmarBorrado, FotoDocumento, PantallaDocumento, useFotoDocumento, useOrdenable, type Bilingue } from './formulario';
import { Boton, campo } from './ui';

type Dificultad = '' | 'baja' | 'media' | 'alta';

interface Experiencia {
	_k: string;
	titulo: Bilingue;
	texto: Bilingue;
	duracion: Bilingue;
	dificultad: Dificultad;
	foto: string;
	alt: Bilingue;
}
interface Datos {
	aviso: Bilingue;
	items: Experiencia[];
}

const vacio = (): Bilingue => ({ es: '', en: '' });
const nueva = (): Experiencia => conClave({ titulo: vacio(), texto: vacio(), duracion: vacio(), dificultad: '' as Dificultad, foto: '', alt: vacio() });
const h2 = 'm-0 font-serif text-[clamp(26px,2.6vw,32px)] font-normal';

export function Experiencias({ repo, onGuardado }: { repo: Repo | null; onGuardado: (sha: string) => void }) {
	const doc = useDocumento<Datos>('experiencias.json', repo, (d) => ({ ...d, items: d.items.map(conClave) }));
	/** Experiencia abierta en el panel lateral (copia: se aplica con «Aplicar»). */
	const [editando, setEditando] = useState<{ x: Experiencia; esNueva: boolean } | null>(null);

	const d = doc.datos;
	const setItems = (f: (a: Experiencia[]) => Experiencia[]) => doc.setDatos((x) => ({ ...x, items: f(x.items) }));
	const orden = useOrdenable(d?.items ?? [], (a) => setItems(() => a), (x) => x.titulo.es || 'Sin título');

	return (
		<PantallaDocumento
			titulo="Experiencias"
			accion={
				<Boton class="min-h-12 px-5 text-base" onClick={() => setEditando({ x: nueva(), esNueva: true })}>
					+ Nueva experiencia
				</Boton>
			}
			doc={doc}
			errores={{}}
			mensaje="CMS: Actualiza las experiencias"
			onGuardado={onGuardado}
		>
			{() =>
				d && (
					<>
						{orden.anuncio}
						<section aria-labelledby="av-t" class="flex flex-col gap-3">
							<h2 id="av-t" class={h2}>
								Aviso general
							</h2>
							<CampoBilingue
								etiqueta="Se muestra arriba de la lista, en un recuadro ámbar"
								ayuda="Si lo dejas vacío, no se muestra."
								multilinea
								filas={2}
								valor={d.aviso}
								onCambio={(v) => doc.setDatos((x) => ({ ...x, aviso: v }))}
							/>
						</section>

						<section aria-labelledby="ls-t" class="flex flex-col gap-3">
							<div class="flex flex-wrap items-baseline justify-between gap-2">
								<h2 id="ls-t" class={h2}>
									Orden en el sitio
								</h2>
								<span class="text-sm text-muted">Arrastra las filas o usa las flechas.</span>
							</div>
							<ol class="m-0 list-none border-t-2 border-ink p-0">
								{d.items.map((x, i) => (
									<Fila key={x._k} x={x} i={i} doc={doc} repo={repo!} orden={orden} onEditar={() => setEditando({ x: { ...x }, esNueva: false })} />
								))}
							</ol>
						</section>

						{editando && (
							<PanelExperiencia
								inicial={editando.x}
								esNueva={editando.esNueva}
								doc={doc}
								repo={repo!}
								onCerrar={() => setEditando(null)}
								onAplicar={(x) => {
									setItems((a) => (editando.esNueva ? [...a, x] : a.map((y) => (y._k === x._k ? x : y))));
									setEditando(null);
								}}
								onBorrar={() => {
									setItems((a) => a.filter((y) => y._k !== editando.x._k));
									setEditando(null);
								}}
							/>
						)}
					</>
				)
			}
		</PantallaDocumento>
	);
}

function Fila({
	x,
	i,
	doc,
	repo,
	orden,
	onEditar,
}: {
	x: Experiencia;
	i: number;
	doc: EstadoDocumento<Datos>;
	repo: Repo;
	orden: ReturnType<typeof useOrdenable<Experiencia>>;
	onEditar: () => void;
}) {
	const src = useFotoDocumento(x.foto, doc, repo);
	return (
		<li {...orden.arrastre(i)} class="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-line py-3">
			<Asa />
			<span class="w-6 font-serif text-lg text-amber-ink italic">{String(i + 1).padStart(2, '0')}</span>
			{src ? (
				<img src={src} alt="" class="h-12 w-[72px] flex-none rounded-sm object-cover" />
			) : (
				<span class="flex h-12 w-[72px] flex-none items-center justify-center rounded-sm border border-dashed border-line text-center text-[11px] leading-tight text-muted">
					Foto
					<br />
					pendiente
				</span>
			)}
			<div class="flex min-w-0 flex-[1_1_240px] flex-col gap-0.5">
				<strong class="font-serif text-xl leading-tight font-medium">{x.titulo.es || 'Sin título'}</strong>
				<span class="text-sm text-muted">
					{x.titulo.en}
					{x.duracion.es && ` · ${x.duracion.es}`}
				</span>
			</div>
			<div class="flex items-center gap-1.5">
				{!x.foto && <span class="rounded-pill bg-neutral-bg px-2.5 py-0.5 text-[12.5px] font-semibold text-neutral">Sin foto</span>}
				<button type="button" onClick={onEditar} class="min-h-11 cursor-pointer rounded-sm border border-line bg-transparent px-3.5 text-[14.5px] font-semibold text-ink hover:border-ink">
					Editar
				</button>
				{orden.botones(i)}
			</div>
		</li>
	);
}

function PanelExperiencia({
	inicial,
	esNueva,
	doc,
	repo,
	onCerrar,
	onAplicar,
	onBorrar,
}: {
	inicial: Experiencia;
	esNueva: boolean;
	doc: EstadoDocumento<Datos>;
	repo: Repo;
	onCerrar: () => void;
	onAplicar: (x: Experiencia) => void;
	onBorrar: () => void;
}) {
	const [x, setX] = useState(inicial);
	const [intentado, setIntentado] = useState(false);
	const [borrando, setBorrando] = useState(false);
	const raiz = useRef<HTMLElement>(null);
	const set = (c: Partial<Experiencia>) => setX((y) => ({ ...y, ...c }));

	// Foco dentro del panel, Escape para cerrar y sin desplazar la página de fondo
	useEffect(() => {
		const anterior = document.activeElement as HTMLElement | null;
		raiz.current?.querySelector<HTMLElement>('input, textarea')?.focus();
		const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
		window.addEventListener('keydown', esc);
		document.body.style.overflow = 'hidden';
		return () => {
			window.removeEventListener('keydown', esc);
			document.body.style.overflow = '';
			anterior?.focus();
		};
	}, []);

	const errores: Record<string, string> = {};
	if (!x.titulo.es.trim()) errores.titulo = 'Escribe el título en español.';
	if (x.foto && !x.alt.es.trim()) errores.alt = 'Describe la foto en español.';
	const error = (k: string) => (intentado ? errores[k] : undefined);

	const aplicar = () => {
		setIntentado(true);
		if (!Object.keys(errores).length) onAplicar(x);
	};

	return (
		<div class="fixed inset-0 z-50 flex justify-end">
			<div onClick={onCerrar} class="absolute inset-0 bg-[rgba(10,14,11,.45)]" />
			<section
				ref={raiz}
				role="dialog"
				aria-modal="true"
				aria-labelledby="dw-t"
				class="relative flex h-full w-[min(560px,100vw)] flex-col border-l border-line bg-bg shadow-[-12px_0_32px_rgba(0,0,0,.18)]"
			>
				<div class="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
					<h2 id="dw-t" class="m-0 font-serif text-[26px] font-normal">
						{esNueva ? 'Nueva experiencia' : 'Editar experiencia'}
					</h2>
					<button type="button" onClick={onCerrar} aria-label="Cerrar sin aplicar" class="size-11 cursor-pointer border-0 bg-transparent text-2xl text-ink">
						×
					</button>
				</div>
				<div class="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
					<CampoBilingue etiqueta="Título" requerido pestanas valor={x.titulo} onCambio={(v) => set({ titulo: v })} error={error('titulo')} />
					<CampoBilingue etiqueta="Texto" multilinea filas={4} pestanas valor={x.texto} onCambio={(v) => set({ texto: v })} />
					<CampoBilingue etiqueta="Duración" ayuda="Ejemplo: 2 días · ascenso de 7 h" pestanas valor={x.duracion} onCambio={(v) => set({ duracion: v })} />
					<Campo etiqueta="Dificultad" opcional>
						<select value={x.dificultad} onChange={(e) => set({ dificultad: e.currentTarget.value as Dificultad })} class={campo}>
							<option value="">Sin indicar</option>
							<option value="baja">Baja · Easy</option>
							<option value="media">Media · Moderate</option>
							<option value="alta">Alta · Challenging</option>
						</select>
					</Campo>
					<FotoDocumento etiqueta="Foto" ruta={x.foto} onRuta={(r) => set({ foto: r })} prefijo="experiencia" doc={doc} repo={repo} />
					{x.foto && (
						<CampoBilingue
							etiqueta="Descripción de la foto (texto alternativo)"
							ayuda="Describe lo que se ve, para quien no puede ver la imagen."
							requerido
							pestanas
							valor={x.alt}
							onCambio={(v) => set({ alt: v })}
							error={error('alt')}
						/>
					)}
				</div>
				{borrando && (
					<div class="border-t border-line px-5 py-3">
						<ConfirmarBorrado
							pregunta={`¿Borrar «${x.titulo.es || 'esta experiencia'}»?`}
							texto="Se quitará del sitio cuando guardes los cambios."
							onNo={() => setBorrando(false)}
							onSi={onBorrar}
						/>
					</div>
				)}
				<div class="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
					{!esNueva && (
						<Boton variante="texto-peligro" onClick={() => setBorrando(true)}>
							Borrar
						</Boton>
					)}
					<Boton variante="secundario" class="ml-auto" onClick={onCerrar}>
						Cancelar
					</Boton>
					<Boton onClick={aplicar}>
						{esNueva ? 'Agregar a la lista' : 'Aplicar cambios'} <span aria-hidden="true">→</span>
					</Boton>
				</div>
				<p class="m-0 px-5 pb-3 text-[13px] text-muted">Después pulsa «Guardar cambios» abajo para publicarlo.</p>
			</section>
		</div>
	);
}
