/** Tablero: estado de la publicación, noticias y últimos cambios del repositorio. */
import { useEffect, useState } from 'preact/hooks';
import { mensajeDeError, ultimaPublicacion, ultimosCambios, type CambioReciente, type Publicacion } from '../lib/github';
import type { Repo } from '../lib/noticias';
import { esDemo } from '../lib/demo';
import { Aviso, Cargando, Etiqueta } from './ui';

const ESTADOS: Record<Publicacion['estado'], { texto: string; tono: 'verde' | 'ambar' | 'rojo' | 'neutro'; detalle: string }> = {
	'en-cola': { texto: 'En cola…', tono: 'ambar', detalle: 'GitHub va a compilar el sitio en un momento.' },
	publicando: { texto: 'Publicando…', tono: 'ambar', detalle: 'Se está compilando el sitio. Suele tardar 1 o 2 minutos.' },
	'en-linea': { texto: 'Listo', tono: 'verde', detalle: 'La última compilación terminó bien.' },
	fallo: { texto: 'Falló', tono: 'rojo', detalle: 'La compilación falló: el sitio sigue mostrando la versión anterior. Revisa el detalle en GitHub.' },
	cancelada: { texto: 'Cancelada', tono: 'neutro', detalle: 'La compilación se canceló.' },
};

const fechaHora = (iso: string) =>
	new Intl.DateTimeFormat('es-SV', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export function Tablero({ datos }: { datos: Repo | null }) {
	const [pub, setPub] = useState<Publicacion | null | undefined>(undefined);
	const [pubError, setPubError] = useState('');
	const [cambios, setCambios] = useState<CambioReciente[] | null>(null);
	const [error, setError] = useState('');

	// Estado de la publicación; mientras compila se vuelve a consultar cada 10 s
	useEffect(() => {
		let vivo = true;
		let reloj: ReturnType<typeof setTimeout>;
		const consultar = async () => {
			try {
				const p = await ultimaPublicacion();
				if (!vivo) return;
				setPub(p);
				setPubError('');
				if (p && (p.estado === 'en-cola' || p.estado === 'publicando')) reloj = setTimeout(consultar, 10_000);
			} catch (e) {
				if (vivo) setPubError(mensajeDeError(e));
			}
		};
		consultar();
		ultimosCambios()
			.then((c) => vivo && setCambios(c))
			.catch((e) => vivo && setError(mensajeDeError(e)));
		return () => {
			vivo = false;
			clearTimeout(reloj);
		};
	}, []);

	const publicadas = datos?.noticias.filter((n) => n.publicado).length ?? 0;
	const borradores = datos ? datos.noticias.length - publicadas : 0;

	return (
		<div class="flex flex-col gap-10">
			<h1 class="m-0 font-serif text-[clamp(34px,4vw,48px)] font-normal">Tablero</h1>

			<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
				<section aria-labelledby="pub-t" class="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
					<h2 id="pub-t" class="m-0 text-sm font-semibold text-muted">Publicación del sitio</h2>
					{pubError ? (
						<p class="m-0 text-sm text-muted">{pubError}</p>
					) : pub === undefined ? (
						<Cargando />
					) : pub === null ? (
						<p class="m-0 text-sm text-muted">Todavía no hay compilaciones.</p>
					) : (
						<>
							<div aria-live="polite">
								<Etiqueta tono={ESTADOS[pub.estado].tono}>{ESTADOS[pub.estado].texto}</Etiqueta>
							</div>
							<p class="m-0 text-sm">{ESTADOS[pub.estado].detalle}</p>
							<p class="m-0 text-sm text-muted">
								{fechaHora(pub.fecha)}
								{esDemo() ? (
									' · simulada'
								) : (
									<>
										{' · '}
										<a href={pub.url} target="_blank" rel="noopener">
											ver en GitHub
										</a>
									</>
								)}
							</p>
						</>
					)}
				</section>

				<section aria-labelledby="not-t" class="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
					<h2 id="not-t" class="m-0 text-sm font-semibold text-muted">Noticias</h2>
					{datos ? (
						<p class="m-0 font-serif text-[40px] leading-none">
							{publicadas} <span class="font-sans text-base text-muted">publicadas · {borradores} borradores</span>
						</p>
					) : (
						<Cargando />
					)}
					<div class="flex flex-wrap gap-3 text-sm font-semibold">
						<a href="#/noticias/nueva">+ Nueva noticia</a>
						<a href="#/noticias">Ver todas</a>
					</div>
				</section>
			</div>

			<section aria-labelledby="cam-t" class="flex flex-col gap-3">
				<h2 id="cam-t" class="m-0 font-serif text-[28px] font-normal">Últimos cambios</h2>
				{error && <Aviso tipo="error">{error}</Aviso>}
				{!cambios && !error && <Cargando />}
				{cambios && (
					<ul class="m-0 flex list-none flex-col p-0">
						{cambios.map((c) => (
							<li key={c.sha} class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line py-3">
								{esDemo() ? (
									<span>{c.mensaje}</span>
								) : (
									<a href={c.url} target="_blank" rel="noopener" class="text-ink">
										{c.mensaje}
									</a>
								)}
								<span class="text-sm text-muted">
									{c.autor} · {fechaHora(c.fecha)}
								</span>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
