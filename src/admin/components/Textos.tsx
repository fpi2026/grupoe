/** Textos y avisos (diseno/Panel-Textos.dc.html): aviso temporal, contacto, lema y portada de src/content/datos/sitio.json. */
import { useState } from 'preact/hooks';
import { useDocumento } from '../lib/documento';
import type { Repo } from '../lib/noticias';
import { Campo, CampoBilingue, PantallaDocumento, type Bilingue } from './formulario';
import { campo } from './ui';

interface Sitio {
	aviso: { activo: boolean; tono: 'info' | 'alerta'; texto: Bilingue };
	contacto: { whatsapp: string; correo: string; horario: Bilingue };
	lema: Bilingue;
	portada: { antetitulo: Bilingue; titulo: Bilingue; texto: Bilingue };
}

const h2 = 'm-0 font-serif text-[clamp(26px,2.6vw,32px)] font-normal';
const seccion = 'flex flex-col gap-4 rounded-md border border-line bg-card p-[clamp(18px,2.4vw,28px)]';

export function Textos({ repo, onGuardado }: { repo: Repo | null; onGuardado: (sha: string) => void }) {
	const doc = useDocumento<Sitio>('sitio.json', repo);
	const [idiomaVista, setIdiomaVista] = useState<'es' | 'en'>('es');
	const s = doc.datos;
	const set = <K extends keyof Sitio>(k: K, v: Partial<Sitio[K]>) => doc.setDatos((d) => ({ ...d, [k]: { ...d[k], ...v } }));

	const errores: Record<string, string> = {};
	if (s) {
		if (s.aviso.activo && !s.aviso.texto.es.trim()) errores.aviso = 'Escribe el aviso en español o desactívalo.';
		if (!/^\+503\s?\d{4}-?\d{4}$/.test(s.contacto.whatsapp.trim()) && !/^\+\d[\d\s-]{6,}$/.test(s.contacto.whatsapp.trim()))
			errores.whatsapp = 'Revisa el número: debe empezar con el código de país, por ejemplo +503 7568-3400.';
		if (s.contacto.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.contacto.correo)) errores.correo = 'Revisa el correo, por ejemplo nombre@dominio.com.';
		if (!s.contacto.horario.es.trim()) errores.horario = 'Escribe el horario en español.';
		if (!s.portada.titulo.es.trim()) errores.titulo = 'Escribe el título de portada en español.';
	}

	const textoVista = s ? (idiomaVista === 'en' && s.aviso.texto.en.trim() ? s.aviso.texto.en : s.aviso.texto.es) : '';

	return (
		<PantallaDocumento titulo="Textos y avisos" doc={doc} errores={errores} mensaje="CMS: Actualiza los textos y avisos del sitio" onGuardado={onGuardado}>
			{(error) =>
				s && (
					<>
						<section aria-labelledby="av-t" class={seccion}>
							<div class="flex flex-wrap items-center justify-between gap-3">
								<h2 id="av-t" class={h2}>
									Aviso temporal en el sitio
								</h2>
								<div class="flex items-center gap-3">
									<span id="l-on" class="text-[14.5px] font-semibold">
										{s.aviso.activo ? 'Activo' : 'Inactivo'}
									</span>
									<button
										type="button"
										role="switch"
										aria-checked={s.aviso.activo}
										aria-labelledby="l-on"
										onClick={() => set('aviso', { activo: !s.aviso.activo })}
										class={`relative h-8 w-14 flex-none cursor-pointer rounded-pill border-0 ${s.aviso.activo ? 'bg-ok' : 'bg-line'}`}
									>
										<span class={`absolute top-1 size-6 rounded-full bg-card transition-[left] duration-150 motion-reduce:transition-none ${s.aviso.activo ? 'left-7' : 'left-1'}`} />
									</button>
								</div>
							</div>
							<p class="m-0 max-w-[680px] text-muted">
								Una franja arriba de todas las páginas, para avisos como cierres de acceso o cambios de horario. Desactívala cuando ya no haga falta.
							</p>
							<CampoBilingue
								etiqueta="Texto del aviso"
								requerido={s.aviso.activo}
								valor={s.aviso.texto}
								onCambio={(v) => set('aviso', { texto: v })}
								error={error('aviso')}
								ejemploEs="Acceso cerrado por lluvias. Escríbenos por WhatsApp antes de viajar."
							/>
							<fieldset class="m-0 flex flex-col gap-2 border-0 p-0">
								<legend class="mb-2 p-0 text-[14.5px] font-semibold">Tono</legend>
								<div class="flex gap-0.5 self-start rounded-sm border border-line bg-bg p-[3px]">
									{(
										[
											['info', 'Información'],
											['alerta', 'Alerta'],
										] as const
									).map(([id, texto]) => (
										<button
											key={id}
											type="button"
											aria-pressed={s.aviso.tono === id}
											onClick={() => set('aviso', { tono: id })}
											class="min-h-10 cursor-pointer rounded-[3px] border-0 bg-transparent px-3.5 text-[14.5px] font-semibold text-ink aria-pressed:bg-ink aria-pressed:text-bg"
										>
											{texto}
										</button>
									))}
								</div>
							</fieldset>
							<div class="flex flex-col gap-2">
								<span class="text-[13px] font-semibold tracking-[.1em] text-muted uppercase">Vista previa · así se verá en el sitio</span>
								<div class={`overflow-hidden rounded-sm border border-line bg-bg ${s.aviso.activo ? '' : 'opacity-50'}`}>
									<div
										role="note"
										class={`flex items-center gap-2.5 px-[clamp(14px,3vw,28px)] py-2.5 text-[15px] font-medium ${s.aviso.tono === 'alerta' ? 'bg-amber text-[#1A1206]' : 'bg-forest text-on-forest'}`}
									>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" class="flex-none">
											<circle cx="12" cy="12" r="10" />
											<path d="M12 8v4M12 16h.01" />
										</svg>
										<span class="flex-1">{textoVista || 'Escribe el texto del aviso.'}</span>
										<span aria-hidden="true" class="text-xl">
											×
										</span>
									</div>
									<div class="flex items-center gap-2.5 border-t border-line px-[clamp(14px,3vw,28px)] py-3 text-muted">
										<svg width="20" height="26" viewBox="0 0 40 48" aria-hidden="true">
											<path d="M20.5 2 L3 46" style="stroke:var(--forest);stroke-width:1.8;fill:none" />
											<path d="M19 2 H23.5 L38 46 H30.5 Z" style="fill:var(--forest)" />
										</svg>
										<span class="text-xs font-bold tracking-[.14em] text-ink">CABAÑAS ALPINAS</span>
									</div>
								</div>
								<div class="flex flex-wrap items-center gap-2">
									{(['es', 'en'] as const).map((l) => (
										<button
											key={l}
											type="button"
											aria-pressed={idiomaVista === l}
											onClick={() => setIdiomaVista(l)}
											class="min-h-10 cursor-pointer rounded-sm border border-line bg-transparent px-3 text-sm font-semibold text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg"
										>
											Ver en {l === 'es' ? 'español' : 'inglés'}
										</button>
									))}
									{!s.aviso.activo && <span class="text-sm text-muted">El aviso está inactivo: no aparece en el sitio.</span>}
								</div>
							</div>
						</section>

						<section aria-labelledby="ct-t" class={seccion}>
							<h2 id="ct-t" class={h2}>
								Datos de contacto
							</h2>
							<div class="flex flex-wrap gap-4">
								<Campo etiqueta="WhatsApp" ayuda="Con código de país. Lo usan el botón flotante y las reservas." error={error('whatsapp')} class="flex-[1_1_260px]">
									<input
										type="tel"
										value={s.contacto.whatsapp}
										onInput={(e) => set('contacto', { whatsapp: e.currentTarget.value })}
										aria-invalid={Boolean(error('whatsapp')) || undefined}
										class={`${campo} bg-bg`}
									/>
								</Campo>
								<Campo etiqueta="Correo" opcional ayuda="Si lo dejas vacío, no se muestra." error={error('correo')} class="flex-[1_1_260px]">
									<input
										type="email"
										value={s.contacto.correo}
										placeholder="nombre@dominio.com"
										onInput={(e) => set('contacto', { correo: e.currentTarget.value.trim() })}
										aria-invalid={Boolean(error('correo')) || undefined}
										class={`${campo} bg-bg`}
									/>
								</Campo>
							</div>
							<CampoBilingue
								etiqueta="Horario de atención"
								requerido
								ayuda="Se usa en el pie de página, la portada y la página de contacto."
								valor={s.contacto.horario}
								onCambio={(v) => set('contacto', { horario: v })}
								error={error('horario')}
							/>
						</section>

						<section aria-labelledby="lm-t" class={seccion}>
							<h2 id="lm-t" class={h2}>
								Lema y portada
							</h2>
							<CampoBilingue etiqueta="Lema (debajo del logo)" valor={s.lema} onCambio={(v) => doc.setDatos((d) => ({ ...d, lema: v }))} />
							<CampoBilingue etiqueta="Antetítulo de portada" valor={s.portada.antetitulo} onCambio={(v) => set('portada', { antetitulo: v })} />
							<CampoBilingue
								etiqueta="Título de portada"
								requerido
								ayuda="La parte después de la coma se muestra en cursiva. También aparece en el pie de página."
								valor={s.portada.titulo}
								onCambio={(v) => set('portada', { titulo: v })}
								error={error('titulo')}
							/>
							<CampoBilingue etiqueta="Texto de portada" multilinea filas={3} valor={s.portada.texto} onCambio={(v) => set('portada', { texto: v })} />
						</section>
					</>
				)
			}
		</PantallaDocumento>
	);
}
