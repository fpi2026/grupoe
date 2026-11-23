/** Lista de noticias (diseno/Panel-Noticias.dc.html): filtros con contador, búsqueda y estado de traducción. */
import { useState } from 'preact/hooks';
import { newsTags } from '../../data/noticias';
import { estaVacio, type Repo } from '../lib/noticias';
import { Esqueleto, Insignia, PortadaRepo, claseBoton, contenedor } from './ui';

type Filtro = 'todas' | 'publicadas' | 'borradores';

const FILTROS: [Filtro, string][] = [
	['todas', 'Todas'],
	['publicadas', 'Publicadas'],
	['borradores', 'Borradores'],
];

const fecha = new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const fechaCorta = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? fecha.format(new Date(iso)).replace('.', '') : iso);

/** Texto sin acentos y en minúsculas, para buscar. */
const normal = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function ListaNoticias({ datos }: { datos: Repo | null }) {
	const [filtro, setFiltro] = useState<Filtro>('todas');
	const [q, setQ] = useState('');

	const todas = datos?.noticias ?? [];
	const pasa = (f: Filtro, publicado: boolean) => f === 'todas' || (f === 'publicadas') === publicado;
	const busca = normal(q.trim());
	const lista = todas.filter((n) => {
		if (!pasa(filtro, n.publicado)) return false;
		if (!busca) return true;
		return [n.textos.es?.titulo, n.textos.en?.titulo].some((t) => t && normal(t).includes(busca));
	});
	const vacia = datos && lista.length === 0;
	const sinNoticias = vacia && todas.length === 0;

	return (
		<div class={`${contenedor} flex flex-col gap-6`}>
			<div class="flex flex-wrap items-end justify-between gap-4">
				<h1 class="m-0 font-serif text-[clamp(34px,4vw,52px)] leading-[1.02] font-normal tracking-[-.01em]">Noticias</h1>
				<a href="#/noticias/nueva" class={claseBoton('primario', 'min-h-12 px-5 text-base')}>
					+ Nueva noticia
				</a>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
				<div role="group" aria-label="Filtrar noticias" class="flex gap-0.5 rounded-sm border border-line bg-card p-[3px]">
					{FILTROS.map(([f, texto]) => (
						<button
							key={f}
							type="button"
							onClick={() => setFiltro(f)}
							aria-pressed={filtro === f}
							class="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[3px] border-0 bg-transparent px-3.5 text-[14.5px] font-semibold text-ink aria-pressed:bg-ink aria-pressed:text-bg"
						>
							{texto}
							<span class="font-medium tabular-nums opacity-80">{todas.filter((n) => pasa(f, n.publicado)).length}</span>
						</button>
					))}
				</div>
				<label class="relative min-w-[200px] flex-[0_1_320px]">
					<span class="sr-only">Buscar noticias</span>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" class="absolute top-[13px] left-3 text-muted">
						<circle cx="11" cy="11" r="7" />
						<path d="m20 20-3.5-3.5" />
					</svg>
					<input
						type="search"
						value={q}
						onInput={(e) => setQ(e.currentTarget.value)}
						placeholder="Buscar por título"
						class="min-h-11 w-full rounded-sm border border-line bg-card py-2 pr-3 pl-[38px] text-base text-ink"
					/>
				</label>
			</div>

			{!datos && (
				<ul aria-busy="true" aria-label="Cargando noticias" class="m-0 flex list-none flex-col p-0">
					{['62%', '48%', '70%', '55%'].map((w) => (
						<li key={w} class="flex items-center gap-4 border-b border-line py-3.5">
							<Esqueleto class="h-16 w-24 flex-none rounded-sm" />
							<span class="flex flex-1 flex-col gap-2">
								<Esqueleto class="h-2.5 w-[140px]" />
								<Esqueleto class="h-4" ancho={w} />
							</span>
						</li>
					))}
				</ul>
			)}

			{vacia && (
				<div class="flex max-w-[520px] flex-col items-start gap-3 py-[clamp(32px,5vw,64px)]">
					<h2 class="m-0 font-serif text-[30px] font-normal">
						{sinNoticias ? 'Aún no hay noticias' : busca ? 'Ninguna noticia coincide' : filtro === 'borradores' ? 'No hay borradores' : 'No hay noticias publicadas'}
					</h2>
					<p class="m-0 text-muted">
						{sinNoticias
							? 'Escribe la primera. Puedes guardarla como borrador y publicarla cuando esté lista.'
							: busca
								? 'Revisa cómo escribiste la búsqueda o mira todas las noticias.'
								: 'Cuando guardes una noticia como borrador aparecerá aquí.'}
					</p>
					{sinNoticias ? (
						<a href="#/noticias/nueva" class={claseBoton('primario', 'min-h-12 px-5 text-base')}>
							+ Escribir la primera noticia
						</a>
					) : (
						<button
							type="button"
							onClick={() => {
								setFiltro('todas');
								setQ('');
							}}
							class={claseBoton('contorno')}
						>
							Ver todas las noticias
						</button>
					)}
				</div>
			)}

			{lista.length > 0 && datos && (
				<ul class="m-0 flex list-none flex-col p-0">
					{lista.map((n) => {
						const t = (!estaVacio(n.textos.es) ? n.textos.es : n.textos.en)!;
						const faltaEs = estaVacio(n.textos.es);
						const faltaEn = estaVacio(n.textos.en);
						const href = `#/noticias/editar/${n.slug}`;
						return (
							<li key={n.slug} class="-mx-2 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-sm border-b border-line px-2 py-3.5 hover:bg-surface">
								<PortadaRepo portada={n.portada} archivos={datos.archivos} class="h-16 w-24 flex-none rounded-sm" />
								<div class="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
									<span class="text-[12.5px] font-semibold tracking-[.1em] text-amber-ink uppercase">
										{n.etiquetas.map((e) => newsTags[e].es).join(' · ')}{' '}
										<span class="font-medium tracking-[.04em] text-muted normal-case">· {fechaCorta(n.fecha)}</span>
									</span>
									<a href={href} class="font-serif text-[21px] leading-[1.2] font-medium text-pretty text-ink no-underline hover:text-forest hover:underline">
										{t.titulo}
									</a>
								</div>
								<div class="flex flex-wrap items-center gap-2">
									{n.publicado ? <Insignia tono="ok">Publicada</Insignia> : <Insignia tono="warn">Borrador</Insignia>}
									<Idioma codigo="ES" falta={faltaEs} nombre="español" />
									<Idioma codigo="EN" falta={faltaEn} nombre="inglés" />
									<a href={href} aria-label={`Editar «${t.titulo}»`} class="inline-flex min-h-11 items-center px-3 text-[14.5px] font-semibold">
										Editar →
									</a>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}

function Idioma({ codigo, falta, nombre }: { codigo: string; falta: boolean; nombre: string }) {
	return falta ? (
		<span title={`Falta la traducción al ${nombre}`} class="rounded-[3px] border border-dashed border-amber bg-warn-bg px-2 py-0.5 text-xs font-bold tracking-[.06em] text-warn">
			{codigo} falta
		</span>
	) : (
		<span title={nombre[0]!.toUpperCase() + nombre.slice(1)} class="rounded-[3px] border border-line px-2 py-0.5 text-xs font-bold tracking-[.06em]">
			{codigo}
		</span>
	);
}
