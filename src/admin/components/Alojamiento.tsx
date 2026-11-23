/**
 * Alojamiento (diseno/Panel-Alojamiento.dc.html): Cabañas Alpinas, hospedaje hermano y
 * «Antes de venir». Archivo: src/content/datos/alojamiento.json.
 */
import { useState } from 'preact/hooks';
import { conClave, useDocumento } from '../lib/documento';
import type { Repo } from '../lib/noticias';
import { Campo, CampoBilingue, ConfirmarBorrado, FotoDocumento, ListaFotos, PantallaDocumento, mover, type Bilingue, type FotoConAlt } from './formulario';
import { Boton, campo } from './ui';

type Enlace = '' | 'gastronomia' | 'experiencias' | 'contacto' | 'sostenibilidad';

interface Caracteristica {
	_k: string;
	clave: Bilingue;
	valor: Bilingue;
}
interface Unidad {
	_k: string;
	nombre: Bilingue;
	descripcion: Bilingue;
}
interface Punto {
	_k: string;
	titulo: Bilingue;
	texto: Bilingue;
	enlace: Enlace;
}
interface Alojamiento {
	cabanas: { descripcion: Bilingue; tarifa: string; notaTarifa: Bilingue; caracteristicas: Caracteristica[]; fotos: FotoConAlt[] };
	hermano: { unidades: Unidad[]; tarifas: Bilingue; foto: string; alt: Bilingue };
	antes: Punto[];
}

const vacio = (): Bilingue => ({ es: '', en: '' });
const h2 = 'm-0 font-serif text-[clamp(28px,3vw,38px)] font-normal';
const h3 = 'm-0 font-serif text-[23px] font-medium';
const seccion = 'flex scroll-mt-[130px] flex-col gap-5 rounded-md border border-line bg-card p-[clamp(18px,2.4vw,28px)]';
const flecha = 'size-11 cursor-pointer rounded-sm border border-line bg-transparent text-ink disabled:cursor-default disabled:opacity-35';

const ENLACES: [Enlace, string][] = [
	['', 'Sin enlace'],
	['gastronomia', 'Gastronomía'],
	['experiencias', 'Experiencias'],
	['contacto', 'Cómo llegar'],
	['sostenibilidad', 'Sostenibilidad y aire'],
];

/** Botones ↑ ↓ para listas sencillas. */
function Flechas({ i, total, nombre, onMover }: { i: number; total: number; nombre: string; onMover: (j: number) => void }) {
	return (
		<div class="flex gap-1.5">
			<button type="button" onClick={() => onMover(i - 1)} disabled={i === 0} aria-label={`Subir «${nombre}»`} class={flecha}>
				↑
			</button>
			<button type="button" onClick={() => onMover(i + 1)} disabled={i === total - 1} aria-label={`Bajar «${nombre}»`} class={flecha}>
				↓
			</button>
		</div>
	);
}

export function Alojamiento({ repo, onGuardado }: { repo: Repo | null; onGuardado: (sha: string) => void }) {
	const doc = useDocumento<Alojamiento>('alojamiento.json', repo, (d) => ({
		cabanas: { ...d.cabanas, caracteristicas: d.cabanas.caracteristicas.map(conClave), fotos: d.cabanas.fotos.map(conClave) },
		hermano: { ...d.hermano, unidades: d.hermano.unidades.map(conClave) },
		antes: d.antes.map(conClave),
	}));
	const [quitando, setQuitando] = useState<string | null>(null);
	const a = doc.datos;
	const cab = (c: Partial<Alojamiento['cabanas']>) => doc.setDatos((d) => ({ ...d, cabanas: { ...d.cabanas, ...c } }));
	const her = (c: Partial<Alojamiento['hermano']>) => doc.setDatos((d) => ({ ...d, hermano: { ...d.hermano, ...c } }));
	const antes = (f: (p: Punto[]) => Punto[]) => doc.setDatos((d) => ({ ...d, antes: f(d.antes) }));

	const errores: Record<string, string> = {};
	if (a) {
		if (!a.cabanas.descripcion.es.trim()) errores.descripcion = 'Escribe la descripción en español.';
		if (!/^\d+(\.\d{1,2})?$/.test(a.cabanas.tarifa.trim())) errores.tarifa = 'Escribe solo la cifra en dólares, por ejemplo 120.';
		for (const c of a.cabanas.caracteristicas)
			if (!c.clave.es.trim() || !c.valor.es.trim() || !c.clave.en.trim() || !c.valor.en.trim()) errores[`${c._k}.car`] = 'Completa la clave y el valor en los dos idiomas.';
		for (const f of a.cabanas.fotos) if (!f.alt.es.trim()) errores[`${f._k}.alt`] = 'Describe la foto en español.';
		for (const u of a.hermano.unidades) if (!u.nombre.es.trim()) errores[`${u._k}.nombre`] = 'Escribe el nombre en español.';
		if (a.hermano.foto && !a.hermano.alt.es.trim()) errores.altHermano = 'Describe la foto en español.';
		for (const p of a.antes) if (!p.titulo.es.trim()) errores[`${p._k}.titulo`] = 'Escribe el título en español.';
	}

	return (
		<PantallaDocumento
			titulo="Alojamiento"
			accion={
				<nav aria-label="En esta página" class="flex flex-wrap gap-1 text-[14.5px] font-semibold">
					{[
						['#cabanas', 'Cabañas Alpinas'],
						['#hermano', 'Hospedaje hermano'],
						['#antes', 'Antes de venir'],
					].map(([id, texto]) => (
						<a
							key={id}
							href={id}
							onClick={(e) => {
								e.preventDefault(); // la navegación del panel usa el hash
								document.querySelector(id!)?.scrollIntoView({ behavior: 'smooth' });
							}}
							class="inline-flex min-h-11 items-center rounded-sm border border-line px-3 text-ink no-underline hover:border-ink"
						>
							{texto}
						</a>
					))}
				</nav>
			}
			doc={doc}
			errores={errores}
			mensaje="CMS: Actualiza el alojamiento"
			onGuardado={onGuardado}
		>
			{(error) =>
				a && (
					<>
						<section id="cabanas" aria-labelledby="ca-t" class={seccion}>
							<h2 id="ca-t" class={h2}>
								Cabañas Alpinas
							</h2>
							<CampoBilingue etiqueta="Descripción" requerido multilinea filas={3} valor={a.cabanas.descripcion} onCambio={(v) => cab({ descripcion: v })} error={error('descripcion')} />
							<div class="flex flex-wrap items-start gap-4">
								<Campo etiqueta="Tarifa referencial" error={error('tarifa')} class="flex-[0_1_200px]">
									<span class={`flex overflow-hidden rounded-sm border bg-card ${error('tarifa') ? 'border-danger' : 'border-line'}`}>
										<span class="flex items-center pl-3 text-muted">US$</span>
										<input
											inputMode="decimal"
											value={a.cabanas.tarifa}
											onInput={(e) => cab({ tarifa: e.currentTarget.value.replace(/[^\d.]/g, '') })}
											aria-invalid={Boolean(error('tarifa')) || undefined}
											class="min-h-11 min-w-0 flex-1 border-0 bg-transparent px-2 text-base text-ink"
										/>
									</span>
									<span class="text-[13px] text-muted">También aparece en la portada y en el formulario de reserva.</span>
								</Campo>
								<div class="min-w-0 flex-[1_1_360px]">
									<CampoBilingue etiqueta="Nota de la tarifa" valor={a.cabanas.notaTarifa} onCambio={(v) => cab({ notaTarifa: v })} />
								</div>
							</div>

							<div class="flex flex-col gap-3">
								<div class="flex flex-wrap items-baseline justify-between gap-2">
									<h3 class={h3}>Características</h3>
									<span class="text-sm text-muted">Se muestran como «clave → valor» junto a la descripción.</span>
								</div>
								<ul class="m-0 flex list-none flex-col gap-2 p-0">
									{a.cabanas.caracteristicas.map((c, i) => {
										const nombre = c.clave.es || `característica ${i + 1}`;
										const fila = (campoBi: 'clave' | 'valor', l: 'es' | 'en', ph: string) => (
											<input
												lang={l}
												placeholder={ph}
												aria-label={`${campoBi === 'clave' ? 'Clave' : 'Valor'} en ${l === 'es' ? 'español' : 'inglés'} de «${nombre}»`}
												value={c[campoBi][l]}
												onInput={(e) => {
													const v = e.currentTarget.value;
													cab({ caracteristicas: a.cabanas.caracteristicas.map((y) => (y._k === c._k ? { ...y, [campoBi]: { ...y[campoBi], [l]: v } } : y)) });
												}}
												class={campo}
											/>
										);
										return (
											<li key={c._k} class="flex flex-col gap-2 border-b border-line pb-2">
												<div class="flex flex-wrap items-center gap-2">
													<div class="grid min-w-0 flex-[1_1_480px] grid-cols-2 gap-2 min-[900px]:grid-cols-4">
														{fila('clave', 'es', 'Clave (ES)')}
														{fila('clave', 'en', 'Key (EN)')}
														{fila('valor', 'es', 'Valor (ES)')}
														{fila('valor', 'en', 'Value (EN)')}
													</div>
													<Flechas i={i} total={a.cabanas.caracteristicas.length} nombre={nombre} onMover={(j) => cab({ caracteristicas: mover(a.cabanas.caracteristicas, i, j) })} />
													<button
														type="button"
														onClick={() => setQuitando(c._k)}
														aria-label={`Quitar «${nombre}»`}
														class="size-11 cursor-pointer rounded-sm border-0 bg-transparent text-danger hover:bg-danger-bg"
													>
														✕
													</button>
												</div>
												{error(`${c._k}.car`) && <span class="text-sm font-semibold text-danger">{error(`${c._k}.car`)}</span>}
												{quitando === c._k && (
													<ConfirmarBorrado
														pregunta={`¿Quitar «${nombre}»?`}
														texto="Dejará de aparecer cuando guardes."
														onNo={() => setQuitando(null)}
														onSi={() => {
															cab({ caracteristicas: a.cabanas.caracteristicas.filter((y) => y._k !== c._k) });
															setQuitando(null);
														}}
													/>
												)}
											</li>
										);
									})}
								</ul>
								<Boton variante="contorno" class="self-start" onClick={() => cab({ caracteristicas: [...a.cabanas.caracteristicas, conClave({ clave: vacio(), valor: vacio() })] })}>
									+ Agregar característica
								</Boton>
							</div>

							<div class="flex flex-col gap-3">
								<div class="flex flex-wrap items-baseline justify-between gap-2">
									<h3 class={h3}>Fotos de las cabañas</h3>
									<span class="text-sm text-muted">La primera es la principal. Usa las flechas para ordenar.</span>
								</div>
								<ListaFotos fotos={a.cabanas.fotos} onCambio={(f) => cab({ fotos: f })} prefijo="cabanas" doc={doc} repo={repo!} error={error} minimo={1} />
							</div>
						</section>

						<section id="hermano" aria-labelledby="hh-t" class={seccion}>
							<h2 id="hh-t" class={h2}>
								Hospedaje hermano
							</h2>
							<div class="flex flex-wrap items-start gap-[clamp(20px,3vw,40px)]">
								<div class="flex min-w-0 flex-[2_1_440px] flex-col gap-4">
									<h3 class={h3}>Unidades</h3>
									{a.hermano.unidades.map((u, i) => (
										<div key={u._k} class="flex flex-col gap-3 rounded-sm border border-line bg-bg p-4">
											<div class="flex items-center justify-between gap-2">
												<strong>Unidad {i + 1}</strong>
												<div class="flex items-center gap-1.5">
													<Flechas i={i} total={a.hermano.unidades.length} nombre={u.nombre.es || `unidad ${i + 1}`} onMover={(j) => her({ unidades: mover(a.hermano.unidades, i, j) })} />
													<Boton variante="texto-peligro" onClick={() => setQuitando(u._k)}>
														Quitar
													</Boton>
												</div>
											</div>
											<CampoBilingue
												etiqueta="Nombre"
												requerido
												valor={u.nombre}
												onCambio={(v) => her({ unidades: a.hermano.unidades.map((y) => (y._k === u._k ? { ...y, nombre: v } : y)) })}
												error={error(`${u._k}.nombre`)}
											/>
											<CampoBilingue
												etiqueta="Descripción"
												valor={u.descripcion}
												onCambio={(v) => her({ unidades: a.hermano.unidades.map((y) => (y._k === u._k ? { ...y, descripcion: v } : y)) })}
											/>
											{quitando === u._k && (
												<ConfirmarBorrado
													pregunta={`¿Quitar «${u.nombre.es || 'esta unidad'}»?`}
													texto="Dejará de aparecer cuando guardes."
													onNo={() => setQuitando(null)}
													onSi={() => {
														her({ unidades: a.hermano.unidades.filter((y) => y._k !== u._k) });
														setQuitando(null);
													}}
												/>
											)}
										</div>
									))}
									<Boton variante="contorno" class="self-start" onClick={() => her({ unidades: [...a.hermano.unidades, conClave({ nombre: vacio(), descripcion: vacio() })] })}>
										+ Agregar unidad
									</Boton>
									<CampoBilingue etiqueta="Texto de tarifas" valor={a.hermano.tarifas} onCambio={(v) => her({ tarifas: v })} />
								</div>
								<div class="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
									<FotoDocumento etiqueta="Foto del hospedaje hermano" ruta={a.hermano.foto} onRuta={(r) => her({ foto: r })} prefijo="hermano" doc={doc} repo={repo!} />
									{a.hermano.foto && (
										<CampoBilingue
											etiqueta="Descripción de la foto (texto alternativo)"
											requerido
											pestanas
											valor={a.hermano.alt}
											onCambio={(v) => her({ alt: v })}
											error={error('altHermano')}
										/>
									)}
								</div>
							</div>
						</section>

						<section id="antes" aria-labelledby="ac-t" class={seccion}>
							<h2 id="ac-t" class={h2}>
								Antes de venir
							</h2>
							{a.antes.map((p, i) => (
								<div key={p._k} class="flex flex-col gap-3 rounded-sm border border-line bg-bg p-4">
									<div class="flex items-center justify-between gap-2">
										<strong>Punto {i + 1}</strong>
										<div class="flex items-center gap-1.5">
											<Flechas i={i} total={a.antes.length} nombre={p.titulo.es || `punto ${i + 1}`} onMover={(j) => antes((x) => mover(x, i, j))} />
											<Boton variante="texto-peligro" onClick={() => setQuitando(p._k)}>
												Quitar
											</Boton>
										</div>
									</div>
									<CampoBilingue
										etiqueta="Título"
										requerido
										valor={p.titulo}
										onCambio={(v) => antes((x) => x.map((y) => (y._k === p._k ? { ...y, titulo: v } : y)))}
										error={error(`${p._k}.titulo`)}
									/>
									<CampoBilingue etiqueta="Texto" multilinea filas={2} valor={p.texto} onCambio={(v) => antes((x) => x.map((y) => (y._k === p._k ? { ...y, texto: v } : y)))} />
									<Campo etiqueta="Enlace" opcional class="max-w-[320px]">
										<select value={p.enlace} onChange={(e) => antes((x) => x.map((y) => (y._k === p._k ? { ...y, enlace: e.currentTarget.value as Enlace } : y)))} class={`${campo} bg-card`}>
											{ENLACES.map(([v, t]) => (
												<option key={v} value={v}>
													{t}
												</option>
											))}
										</select>
									</Campo>
									{quitando === p._k && (
										<ConfirmarBorrado
											pregunta={`¿Quitar «${p.titulo.es || 'este punto'}»?`}
											texto="Dejará de aparecer cuando guardes."
											onNo={() => setQuitando(null)}
											onSi={() => {
												antes((x) => x.filter((y) => y._k !== p._k));
												setQuitando(null);
											}}
										/>
									)}
								</div>
							))}
							<Boton variante="contorno" class="self-start" onClick={() => antes((x) => [...x, conClave({ titulo: vacio(), texto: vacio(), enlace: '' as Enlace })])}>
								+ Agregar punto
							</Boton>
						</section>
					</>
				)
			}
		</PantallaDocumento>
	);
}
