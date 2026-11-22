/** Lista de noticias con filtro por estado (publicadas / borradores). */
import { useState } from 'preact/hooks';
import { newsTags } from '../../data/noticias';
import { LANGS, estaVacio, type Repo } from '../lib/noticias';
import { Etiqueta, PortadaRepo } from './ui';

type Filtro = 'todas' | 'publicadas' | 'borradores';

export function ListaNoticias({ datos, onRecargar }: { datos: Repo; onRecargar: () => void }) {
	const [filtro, setFiltro] = useState<Filtro>('todas');
	const lista = datos.noticias.filter((n) => filtro === 'todas' || (filtro === 'publicadas' ? n.publicado : !n.publicado));
	const cuenta = (f: Filtro) =>
		datos.noticias.filter((n) => f === 'todas' || (f === 'publicadas' ? n.publicado : !n.publicado)).length;

	return (
		<div class="flex flex-col gap-8">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<h1 class="m-0 font-serif text-[clamp(34px,4vw,48px)] font-normal">Noticias</h1>
				<div class="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={onRecargar}
						class="inline-flex h-11 items-center rounded-sm border border-line px-4 font-semibold text-ink hover:border-ink"
					>
						Actualizar
					</button>
					<a
						href="#/noticias/nueva"
						class="inline-flex h-11 items-center rounded-sm bg-btn px-4 font-semibold text-btn-ink no-underline hover:text-btn-ink hover:brightness-110"
					>
						+ Nueva noticia
					</a>
				</div>
			</div>

			<div role="group" aria-label="Filtrar por estado" class="flex flex-wrap gap-2">
				{(['todas', 'publicadas', 'borradores'] as Filtro[]).map((f) => (
					<button
						type="button"
						aria-pressed={filtro === f}
						onClick={() => setFiltro(f)}
						class="h-10 rounded-pill border border-line px-4 text-sm font-semibold capitalize text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg"
					>
						{f} <span class="font-normal opacity-60">{cuenta(f)}</span>
					</button>
				))}
			</div>

			{lista.length === 0 ? (
				<p class="m-0 text-muted">No hay noticias en esta vista.</p>
			) : (
				<ul class="m-0 flex list-none flex-col p-0">
					{lista.map((n) => {
						const t = (!estaVacio(n.textos.es) ? n.textos.es : n.textos.en)!;
						return (
							<li key={n.slug} class="border-t border-line">
								<a
									href={`#/noticias/editar/${n.slug}`}
									class="grid grid-cols-[96px_1fr] items-center gap-4 py-4 text-ink no-underline hover:bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] hover:text-ink sm:grid-cols-[128px_1fr_auto]"
								>
									<PortadaRepo portada={n.portada} archivos={datos.archivos} class="aspect-[3/2] w-full rounded-md" />
									<div class="flex min-w-0 flex-col gap-1">
										<span class="text-xs font-semibold tracking-[.12em] text-amber-ink uppercase">
											{n.etiquetas.map((e) => newsTags[e].es).join(' · ')} · {n.fecha}
										</span>
										<span class="font-serif text-[22px] leading-tight">{t.titulo}</span>
									</div>
									<div class="col-span-2 flex flex-wrap gap-1.5 sm:col-span-1 sm:justify-end">
										{n.publicado ? <Etiqueta tono="verde">Publicada</Etiqueta> : <Etiqueta tono="ambar">Borrador</Etiqueta>}
										{LANGS.map((l) =>
											estaVacio(n.textos[l]) ? (
												<Etiqueta key={l} tono="rojo">
													Falta {l.toUpperCase()}
												</Etiqueta>
											) : (
												<Etiqueta key={l}>{l.toUpperCase()}</Etiqueta>
											),
										)}
									</div>
								</a>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
