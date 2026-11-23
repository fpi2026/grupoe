/** Reconocimientos (diseno/Panel-Reconocimientos.dc.html): lista ordenable de src/content/datos/reconocimientos.json. */
import { useState } from 'preact/hooks';
import { conClave, useDocumento } from '../lib/documento';
import type { Repo } from '../lib/noticias';
import { Asa, Campo, CampoBilingue, ConfirmarBorrado, FotoDocumento, PantallaDocumento, useFotoDocumento, useOrdenable, type Bilingue } from './formulario';
import { Boton, campo } from './ui';

interface Reconocimiento {
	_k: string;
	nombre: Bilingue;
	entidad: Bilingue;
	anio: string;
	logo: string;
}
interface Datos {
	items: Reconocimiento[];
}

const vacio = (): Reconocimiento => conClave({ nombre: { es: '', en: '' }, entidad: { es: '', en: '' }, anio: '', logo: '' });

export function Reconocimientos({ repo, onGuardado }: { repo: Repo | null; onGuardado: (sha: string) => void }) {
	const doc = useDocumento<Datos>('reconocimientos.json', repo, (d) => ({ items: d.items.map(conClave) }));
	const [abierto, setAbierto] = useState<string | null>(null);
	const [borrando, setBorrando] = useState<string | null>(null);

	const items = doc.datos?.items ?? [];
	const setItems = (f: (a: Reconocimiento[]) => Reconocimiento[]) => doc.setDatos((d) => ({ items: f(d.items) }));
	const editar = (k: string, cambio: Partial<Reconocimiento>) => setItems((a) => a.map((x) => (x._k === k ? { ...x, ...cambio } : x)));
	const orden = useOrdenable(items, (a) => setItems(() => a), (x) => x.nombre.es || 'Sin nombre');

	const errores: Record<string, string> = {};
	for (const x of items) {
		if (!x.nombre.es.trim()) errores[`${x._k}.nombre`] = 'Escribe el nombre en español.';
		if (x.anio && !/^\d{4}$/.test(x.anio)) errores[`${x._k}.anio`] = 'Escribe el año con cuatro cifras, por ejemplo 2025.';
	}

	return (
		<PantallaDocumento
			titulo="Reconocimientos"
			intro="Aparecen en la portada del sitio en este orden. El año y el logo son opcionales."
			accion={
				<Boton
					class="min-h-12 px-5 text-base"
					onClick={() => {
						const n = vacio();
						setItems((a) => [...a, n]);
						setAbierto(n._k);
					}}
				>
					+ Nuevo reconocimiento
				</Boton>
			}
			doc={doc}
			errores={errores}
			mensaje="CMS: Actualiza los reconocimientos"
			onGuardado={onGuardado}
		>
			{(error) => (
				<>
					{orden.anuncio}
					{items.length === 0 && <p class="m-0 text-muted">No hay reconocimientos. La sección de la portada se mostrará vacía.</p>}
					<ol class="m-0 list-none border-t-2 border-ink p-0">
						{items.map((x, i) => {
							const open = abierto === x._k || Boolean(error(`${x._k}.nombre`) || error(`${x._k}.anio`));
							return (
								<li key={x._k} {...orden.arrastre(i, !open)} class="flex flex-col gap-3.5 border-b border-line py-3">
									<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
										<Asa />
										<Logo x={x} doc={doc} repo={repo!} />
										<div class="flex min-w-0 flex-[1_1_280px] flex-col gap-0.5">
											<strong class="font-serif text-xl leading-tight font-medium">{x.nombre.es || 'Sin nombre'}</strong>
											<span class="text-sm text-muted">
												{x.entidad.es}
												{x.anio && ` · ${x.anio}`}
											</span>
										</div>
										<div class="flex items-center gap-1.5">
											<button
												type="button"
												onClick={() => setAbierto(abierto === x._k ? null : x._k)}
												aria-expanded={open}
												class="min-h-11 cursor-pointer rounded-sm border border-line bg-transparent px-3.5 text-[14.5px] font-semibold text-ink aria-expanded:border-ink aria-expanded:bg-ink aria-expanded:text-bg"
											>
												{open ? 'Cerrar' : 'Editar'}
											</button>
											{orden.botones(i)}
										</div>
									</div>
									{open && (
										<div class="flex flex-col gap-4 rounded-sm border border-line bg-card p-4 sm:ml-[34px]">
											<CampoBilingue etiqueta="Nombre del reconocimiento" requerido valor={x.nombre} onCambio={(v) => editar(x._k, { nombre: v })} error={error(`${x._k}.nombre`)} />
											<div class="flex flex-wrap gap-4">
												<div class="flex-[2_1_260px]">
													<CampoBilingue
														etiqueta="Entidad que lo otorga"
														ayuda="Si el nombre es igual en inglés, puedes dejar el inglés vacío."
														valor={x.entidad}
														onCambio={(v) => editar(x._k, { entidad: v })}
														pestanas
													/>
												</div>
												<Campo etiqueta="Año" opcional error={error(`${x._k}.anio`)} class="flex-[1_1_120px]">
													<input
														inputMode="numeric"
														maxLength={4}
														placeholder="Ej. 2025"
														value={x.anio}
														onInput={(e) => editar(x._k, { anio: e.currentTarget.value.replace(/\D/g, '') })}
														aria-invalid={Boolean(error(`${x._k}.anio`)) || undefined}
														class={`${campo} bg-bg`}
													/>
												</Campo>
											</div>
											<div class="max-w-[280px]">
												<FotoDocumento
													etiqueta="Logo (opcional)"
													ruta={x.logo}
													onRuta={(r) => editar(x._k, { logo: r })}
													prefijo="logo"
													doc={doc}
													repo={repo!}
													proporcion="1/1"
													insigniaPendiente="Sin logo"
													textoPendiente="Sin logo: en el sitio solo se ve el nombre."
												/>
											</div>
											{borrando === x._k ? (
												<ConfirmarBorrado
													pregunta="¿Borrar este reconocimiento?"
													texto="Dejará de aparecer en el sitio cuando guardes."
													onNo={() => setBorrando(null)}
													onSi={() => {
														setItems((a) => a.filter((y) => y._k !== x._k));
														setBorrando(null);
														setAbierto(null);
													}}
												/>
											) : (
												<Boton variante="texto-peligro" class="self-start" onClick={() => setBorrando(x._k)}>
													Borrar reconocimiento
												</Boton>
											)}
										</div>
									)}
								</li>
							);
						})}
					</ol>
				</>
			)}
		</PantallaDocumento>
	);
}

function Logo({ x, doc, repo }: { x: Reconocimiento; doc: ReturnType<typeof useDocumento<Datos>>; repo: Repo }) {
	const src = useFotoDocumento(x.logo, doc, repo);
	return src ? (
		<img src={src} alt="" class="size-14 flex-none rounded-sm border border-line bg-white object-contain" />
	) : (
		<span class="flex size-14 flex-none items-center justify-center overflow-hidden rounded-sm border border-dashed border-line p-1 text-center text-[13px] leading-[1.1] font-bold text-muted">
			{x.entidad.es}
		</span>
	);
}
