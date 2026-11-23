/** Gastronomía (diseno/Panel-Gastronomia.dc.html): nota, platillos y fotos de src/content/datos/menu.json. */
import { useState } from 'preact/hooks';
import { conClave, useDocumento } from '../lib/documento';
import type { Repo } from '../lib/noticias';
import { Asa, CampoBilingue, ConfirmarBorrado, ListaFotos, PantallaDocumento, useOrdenable, type Bilingue } from './formulario';
import { Boton } from './ui';

interface Platillo {
	_k: string;
	nombre: Bilingue;
	descripcion: Bilingue;
}
interface Foto {
	_k: string;
	foto: string;
	alt: Bilingue;
}
interface Menu {
	nota: Bilingue;
	platillos: Platillo[];
	fotos: Foto[];
}

const vacio = (): Bilingue => ({ es: '', en: '' });
const h2 = 'm-0 font-serif text-[clamp(26px,2.6vw,32px)] font-normal';

export function Gastronomia({ repo, onGuardado }: { repo: Repo | null; onGuardado: (sha: string) => void }) {
	const doc = useDocumento<Menu>('menu.json', repo, (d) => ({ ...d, platillos: d.platillos.map(conClave), fotos: d.fotos.map(conClave) }));
	const [abierto, setAbierto] = useState<string | null>(null);
	const [borrando, setBorrando] = useState<string | null>(null);

	const m = doc.datos;
	const set = (cambio: Partial<Menu>) => doc.setDatos((d) => ({ ...d, ...cambio }));
	const setPlatillos = (f: (a: Platillo[]) => Platillo[]) => doc.setDatos((d) => ({ ...d, platillos: f(d.platillos) }));
	const setFotos = (f: (a: Foto[]) => Foto[]) => doc.setDatos((d) => ({ ...d, fotos: f(d.fotos) }));
	const orden = useOrdenable(m?.platillos ?? [], (a) => setPlatillos(() => a), (x) => x.nombre.es || 'Sin nombre');

	const errores: Record<string, string> = {};
	if (m) {
		if (!m.nota.es.trim()) errores.nota = 'Escribe la nota en español.';
		for (const x of m.platillos) if (!x.nombre.es.trim()) errores[`${x._k}.nombre`] = 'Escribe el nombre en español.';
		for (const f of m.fotos) if (!f.alt.es.trim()) errores[`${f._k}.alt`] = 'Describe la foto en español.';
	}

	return (
		<PantallaDocumento titulo="Gastronomía" doc={doc} errores={errores} mensaje="CMS: Actualiza el menú de gastronomía" onGuardado={onGuardado}>
			{(error) =>
				m && (
					<>
						{orden.anuncio}
						<section aria-labelledby="nt-t" class="flex flex-col gap-3">
							<h2 id="nt-t" class={h2}>
								Nota general
							</h2>
							<CampoBilingue etiqueta="Se destaca junto al título de la página" requerido valor={m.nota} onCambio={(v) => set({ nota: v })} error={error('nota')} />
						</section>

						<section aria-labelledby="pl-t" class="flex flex-col gap-3">
							<div class="flex flex-wrap items-baseline justify-between gap-2">
								<h2 id="pl-t" class={h2}>
									Platillos
								</h2>
								<span class="text-sm text-muted">En el sitio aparecen en este orden.</span>
							</div>
							<ol class="m-0 list-none border-t-2 border-ink p-0">
								{m.platillos.map((x, i) => {
									const open = abierto === x._k || Boolean(error(`${x._k}.nombre`));
									return (
										<li key={x._k} {...orden.arrastre(i, !open)} class="flex flex-col gap-3.5 border-b border-line py-3">
											<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
												<Asa />
												<div class="flex min-w-0 flex-[1_1_280px] flex-col gap-0.5">
													<strong class="font-serif text-xl leading-tight font-medium">
														{x.nombre.es || 'Sin nombre'} {x.nombre.en && <span class="font-sans text-sm font-normal text-muted">· {x.nombre.en}</span>}
													</strong>
													<span class="text-sm text-muted">{x.descripcion.es}</span>
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
													<CampoBilingue
														etiqueta="Nombre"
														requerido
														valor={x.nombre}
														onCambio={(v) => setPlatillos((a) => a.map((y) => (y._k === x._k ? { ...y, nombre: v } : y)))}
														error={error(`${x._k}.nombre`)}
													/>
													<CampoBilingue
														etiqueta="Descripción"
														multilinea
														filas={2}
														valor={x.descripcion}
														onCambio={(v) => setPlatillos((a) => a.map((y) => (y._k === x._k ? { ...y, descripcion: v } : y)))}
													/>
													{borrando === x._k ? (
														<ConfirmarBorrado
															pregunta={`¿Quitar «${x.nombre.es || 'este platillo'}»?`}
															texto="Dejará de aparecer en el sitio cuando guardes."
															onNo={() => setBorrando(null)}
															onSi={() => {
																setPlatillos((a) => a.filter((y) => y._k !== x._k));
																setBorrando(null);
															}}
														/>
													) : (
														<Boton variante="texto-peligro" class="self-start" onClick={() => setBorrando(x._k)}>
															Quitar platillo
														</Boton>
													)}
												</div>
											)}
										</li>
									);
								})}
							</ol>
							<Boton
								variante="contorno"
								class="self-start"
								onClick={() => {
									const n = conClave({ nombre: vacio(), descripcion: vacio() });
									setPlatillos((a) => [...a, n]);
									setAbierto(n._k);
								}}
							>
								+ Agregar platillo
							</Boton>
						</section>

						<section aria-labelledby="ft-t" class="flex flex-col gap-3">
							<div class="flex flex-wrap items-baseline justify-between gap-2">
								<h2 id="ft-t" class={h2}>
									Fotos de la sección
								</h2>
								<span class="text-sm text-muted">Se muestran debajo del menú, en este orden.</span>
							</div>
							<ListaFotos fotos={m.fotos} onCambio={(a) => setFotos(() => a)} prefijo="gastronomia" doc={doc} repo={repo!} error={error} />
						</section>
					</>
				)
			}
		</PantallaDocumento>
	);
}
