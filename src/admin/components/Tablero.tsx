/** Tablero (diseno/Panel-Tablero.dc.html): publicación del sitio, secciones y últimos cambios. */
import { useEffect, useState } from 'preact/hooks';
import { mensajeDeError, ultimosCambios, type CambioReciente, type Publicacion } from '../lib/github';
import { estaVacio, type Repo } from '../lib/noticias';
import { esDemo } from '../lib/demo';
import { usePublicacion } from '../lib/publicacion';
import { leerTexto } from '../lib/github';
import { CARPETA_DATOS } from '../lib/documento';
import { SECCIONES, type Seccion } from '../secciones';
import { Aviso, Esqueleto, Girando, Insignia, claseBoton, contenedor, type Tono } from './ui';

const ESTADOS: Record<Publicacion['estado'], { titulo: string; texto: string; color: string; paso: number }> = {
	'en-cola': {
		titulo: 'En cola',
		texto: 'Tu cambio está en espera. Empezará a publicarse en unos segundos; puedes seguir trabajando.',
		color: 'text-warn',
		paso: 0,
	},
	publicando: {
		titulo: 'Publicando…',
		texto: 'El sitio se está actualizando. Tarda 1 o 2 minutos. Mientras tanto, el sitio sigue mostrando la versión anterior.',
		color: 'text-warn',
		paso: 1,
	},
	'en-linea': { titulo: 'Listo', texto: 'El sitio muestra todos los cambios guardados.', color: 'text-ok', paso: 2 },
	fallo: {
		titulo: 'Falló',
		texto:
			'No se pudo publicar el último cambio. El sitio sigue mostrando la versión anterior; tu cambio está guardado. Revisa el detalle en GitHub o vuelve a guardar y, si se repite, avisa a administración.',
		color: 'text-danger',
		paso: 1,
	},
	cancelada: { titulo: 'Cancelada', texto: 'La publicación se canceló. El sitio sigue mostrando la versión anterior.', color: 'text-neutral', paso: 1 },
};

const hora = new Intl.DateTimeFormat('es-SV', { hour: 'numeric', minute: '2-digit' });
const diaSemana = new Intl.DateTimeFormat('es-SV', { weekday: 'long' });
const fechaCorta = new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short', year: 'numeric' });

/** «hoy, 10:42», «ayer, 17:30», «lunes, 8:20» o «12 nov 2026». */
export function cuando(iso: string): string {
	const f = new Date(iso);
	const hoy = new Date();
	const dias = Math.round((new Date(hoy.toDateString()).getTime() - new Date(f.toDateString()).getTime()) / 86_400_000);
	if (dias === 0) return `hoy, ${hora.format(f)}`;
	if (dias === 1) return `ayer, ${hora.format(f)}`;
	if (dias > 1 && dias < 7) return `${diaSemana.format(f)}, ${hora.format(f)}`;
	return fechaCorta.format(f).replace('.', '');
}

interface CambioLegible {
	seccion: string;
	/** Ruta de la sección en el panel (para el enlace). */
	ruta?: string;
	verbo: string;
	que: string;
	estado?: { texto: string; tono: Tono };
}

/** Traduce el mensaje del commit que escribe el panel («CMS: Agrega la noticia «…» (borrador)»). */
function leerCambio(mensaje: string): CambioLegible {
	const seccion = SECCIONES.find((s) => s.enCommit && mensaje === `CMS: Actualiza ${s.enCommit}`);
	if (seccion) return { seccion: seccion.texto, ruta: seccion.ruta, verbo: 'Editó', que: seccion.texto, estado: { texto: 'Publicado', tono: 'ok' } };
	const m = /^CMS: (Agrega|Actualiza|Borra) la noticia «(.+)»( \(borrador\))?$/.exec(mensaje);
	if (!m) return { seccion: 'Sitio', verbo: 'Cambio', que: mensaje };
	const verbo = { Agrega: 'Creó', Actualiza: 'Editó', Borra: 'Borró' }[m[1] as 'Agrega' | 'Actualiza' | 'Borra'];
	const estado: CambioLegible['estado'] =
		m[1] === 'Borra' ? { texto: 'Borrado', tono: 'neutral' } : m[3] ? { texto: 'Borrador', tono: 'warn' } : { texto: 'Publicado', tono: 'ok' };
	return { seccion: 'Noticias', verbo, que: m[2]!, estado };
}

export function Tablero({ datos, nombre }: { datos: Repo | null; nombre: string }) {
	const { pub, error: pubError } = usePublicacion();
	const [cambios, setCambios] = useState<CambioReciente[] | null>(null);
	const [error, setError] = useState('');
	const demo = esDemo();

	// Se vuelven a leer cada vez que cambian los datos (después de guardar o borrar)
	useEffect(() => {
		let vivo = true;
		ultimosCambios()
			.then((c) => vivo && setCambios(c))
			.catch((e) => vivo && setError(mensajeDeError(e)));
		return () => {
			vivo = false;
		};
	}, [datos]);

	const publicadas = datos?.noticias.filter((n) => n.publicado).length ?? 0;
	const borradores = datos ? datos.noticias.length - publicadas : 0;
	const sinIngles = datos?.noticias.filter((n) => estaVacio(n.textos.en)).length ?? 0;

	/** Enlace de un cambio: la noticia si todavía existe; si no, el commit en GitHub. */
	const enlace = (c: CambioReciente, l: CambioLegible) => {
		const n = l.seccion === 'Noticias' ? datos?.noticias.find((x) => x.textos.es?.titulo === l.que || x.textos.en?.titulo === l.que) : undefined;
		if (n && l.estado?.texto !== 'Borrado') return { href: `#/noticias/editar/${n.slug}` };
		if (l.ruta) return { href: `#${l.ruta}` };
		return demo ? null : { href: c.url, target: '_blank', rel: 'noopener' };
	};

	const e = pub ? ESTADOS[pub.estado] : null;
	const ultimo = cambios?.[0];

	return (
		<div class={`${contenedor} flex flex-col gap-[clamp(28px,3vw,40px)]`}>
			<div class="flex flex-col gap-1">
				<span class="text-sm text-muted">Hola, {nombre}</span>
				<h1 class="m-0 font-serif text-[clamp(34px,4vw,52px)] leading-[1.02] font-normal tracking-[-.01em]">Tablero</h1>
			</div>

			<section
				id="publicacion"
				aria-labelledby="pub-t"
				class={`flex flex-col gap-5 rounded-md border bg-card p-[clamp(18px,2.4vw,28px)] ${pub?.estado === 'fallo' ? 'border-danger' : 'border-line'}`}
			>
				<div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
					<div class="flex min-w-0 flex-[1_1_360px] flex-col gap-1.5">
						<h2 id="pub-t" class="m-0 text-[12.5px] font-bold tracking-[.14em] text-muted uppercase">
							Publicación del sitio
						</h2>
						{pubError ? (
							<p class="m-0 text-muted">{pubError}</p>
						) : !pub || !e ? (
							pub === null ? (
								<p class="m-0 text-muted">Todavía no hay publicaciones.</p>
							) : (
								<>
									<Esqueleto class="h-9 w-[220px]" />
									<Esqueleto class="h-4 w-[min(100%,480px)]" />
								</>
							)
						) : (
							<>
								<p role="status" class={`m-0 flex items-center gap-3 font-serif text-[clamp(28px,3vw,38px)] leading-[1.1] ${e.color}`}>
									{pub.estado === 'publicando' ? (
										<Girando class="size-6 border-[3px]" />
									) : (
										<span aria-hidden="true" class="flex size-7 flex-none items-center justify-center rounded-full bg-current font-sans text-[15px] font-bold">
											<span class="text-card">{pub.estado === 'en-linea' ? '✓' : pub.estado === 'fallo' ? '!' : '…'}</span>
										</span>
									)}
									<span>{e.titulo}</span>
								</p>
								<p class="m-0 max-w-[620px] text-pretty">{e.texto}</p>
							</>
						)}
					</div>
					<div class="flex flex-wrap gap-2">
						{pub && (pub.estado === 'fallo' || pub.estado === 'cancelada') && !demo && pub.url && (
							<a href={pub.url} target="_blank" rel="noopener" class={claseBoton('primario')}>
								Ver el detalle en GitHub ↗
							</a>
						)}
						<a href={import.meta.env.BASE_URL} target="_blank" rel="noopener" class={claseBoton('secundario')}>
							Ver sitio ↗
						</a>
					</div>
				</div>

				{pub && e && (
					<ol aria-label="Pasos de publicación" class="m-0 grid list-none grid-cols-3 gap-1.5 p-0">
						{['En cola', pub.estado === 'fallo' ? 'Falló al publicar' : pub.estado === 'cancelada' ? 'Cancelada' : 'Publicando…', 'Listo'].map((texto, i) => {
							const listo = pub.estado === 'en-linea';
							const actual = i === e.paso;
							const hecho = i < e.paso || listo;
							const malo = (pub.estado === 'fallo' || pub.estado === 'cancelada') && i === 1;
							const barra = malo ? (pub.estado === 'fallo' ? 'bg-danger' : 'bg-neutral') : hecho || actual ? (listo ? 'bg-ok' : 'bg-amber') : 'bg-line';
							return (
								<li key={i} aria-current={actual ? 'step' : undefined} class="flex flex-col gap-2">
									<span class={`h-1 rounded-pill ${barra}`} />
									<span class={`text-[13.5px] ${actual ? 'font-bold' : 'font-medium'} ${malo && pub.estado === 'fallo' ? 'text-danger' : actual || hecho ? 'text-ink' : 'text-muted'}`}>
										{texto}
									</span>
								</li>
							);
						})}
					</ol>
				)}

				{ultimo && (
					<p class="m-0 border-t border-line pt-3.5 text-sm text-muted">
						Último cambio:{' '}
						<strong class="text-ink">
							{(() => {
								const l = leerCambio(ultimo.mensaje);
								return l.seccion === 'Noticias' ? `Noticias · «${l.que}»` : l.ruta ? l.seccion : l.que;
							})()}
						</strong>{' '}
						· {ultimo.autor} · {cuando(ultimo.fecha)}
						{pub && !demo && pub.url && (
							<>
								{' · '}
								<a href={pub.url} target="_blank" rel="noopener">
									ver en GitHub
								</a>
							</>
						)}
						{demo && ' · publicación simulada'}
					</p>
				)}
			</section>

			<section aria-labelledby="res-t" class="flex flex-col gap-4">
				<h2 id="res-t" class="m-0 font-serif text-[clamp(26px,2.6vw,32px)] font-normal">
					Secciones
				</h2>
				<div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
					<article class="flex flex-col gap-3 rounded-md border border-line bg-card p-[18px]">
						<h3 class="m-0 font-serif text-[23px] leading-[1.15] font-medium">
							<a href="#/noticias" class="text-ink no-underline hover:text-forest hover:underline">
								Noticias
							</a>
						</h3>
						{datos ? (
							<p class="m-0 text-[15px]">
								{publicadas} {publicadas === 1 ? 'publicada' : 'publicadas'} · {borradores} {borradores === 1 ? 'borrador' : 'borradores'}
							</p>
						) : (
							<Esqueleto class="h-4 w-40" />
						)}
						{sinIngles > 0 && (
							<p class="m-0 flex items-center gap-2 text-sm font-semibold text-warn">
								<span aria-hidden="true" class="size-2 flex-none rounded-full bg-amber" />
								{sinIngles === 1 ? '1 noticia sin traducción al inglés' : `${sinIngles} noticias sin traducción al inglés`}
							</p>
						)}
						<div class="mt-auto flex flex-wrap gap-2 pt-1">
							<a href="#/noticias/nueva" class={claseBoton('primario', 'px-3.5 text-[14.5px]')}>
								+ Nueva noticia
							</a>
							<a href="#/noticias" class={claseBoton('secundario', 'px-3.5 text-[14.5px]')}>
								Ver noticias
							</a>
						</div>
					</article>
					{SECCIONES.filter((x) => x.archivo).map((x) => (
						<TarjetaSeccion key={x.id} seccion={x} repo={datos} />
					))}
				</div>
			</section>

			<section aria-labelledby="cam-t" class="flex flex-col gap-3">
				<h2 id="cam-t" class="m-0 font-serif text-[clamp(26px,2.6vw,32px)] font-normal">
					Últimos cambios
				</h2>
				{error && <Aviso tipo="error">{error}</Aviso>}
				<ul class="m-0 list-none border-t-2 border-ink p-0" aria-busy={!cambios && !error}>
					{!cambios && !error
						? [62, 48, 70].map((w) => (
								<li key={w} class="flex flex-col gap-2 border-b border-line py-3">
									<Esqueleto class="h-2.5 w-[120px]" />
									<Esqueleto class="h-4" ancho={`${w}%`} />
								</li>
							))
						: cambios?.map((c) => {
								const l = leerCambio(c.mensaje);
								const a = enlace(c, l);
								return (
									<li key={c.sha} class="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line py-3">
										<span class="flex min-w-0 flex-[1_1_320px] flex-col gap-0.5">
											<span class="text-[12.5px] font-semibold tracking-[.1em] text-muted uppercase">
												{l.seccion} · {l.verbo}
											</span>
											{a ? (
												<a {...a} class="overflow-hidden font-medium text-ellipsis text-ink no-underline hover:text-forest hover:underline">
													{l.que}
												</a>
											) : (
												<span class="font-medium">{l.que}</span>
											)}
										</span>
										<span class="flex-[0_0_140px] text-sm">{c.autor}</span>
										<span class="flex-[0_0_120px] text-sm text-muted">{cuando(c.fecha)}</span>
										{l.estado ? <Insignia tono={l.estado.tono}>{l.estado.texto}</Insignia> : <span class="w-[90px]" />}
									</li>
								);
							})}
				</ul>
			</section>
		</div>
	);
}

/** Tarjeta de una sección guardada en JSON, con su resumen. */
function TarjetaSeccion({ seccion, repo }: { seccion: Seccion; repo: Repo | null }) {
	const [resumen, setResumen] = useState<string | null>(null);
	useEffect(() => {
		const sha = repo?.archivos.get(`${CARPETA_DATOS}/${seccion.archivo}`);
		if (!sha) return;
		let vivo = true;
		leerTexto(sha)
			.then((t) => vivo && setResumen(seccion.resumen ? seccion.resumen(JSON.parse(t)) : ''))
			.catch(() => vivo && setResumen(''));
		return () => {
			vivo = false;
		};
	}, [repo, seccion]);
	return (
		<article class="flex flex-col gap-3 rounded-md border border-line bg-card p-[18px]">
			<h3 class="m-0 font-serif text-[23px] leading-[1.15] font-medium">
				<a href={`#${seccion.ruta}`} class="text-ink no-underline hover:text-forest hover:underline">
					{seccion.texto}
				</a>
			</h3>
			{resumen === null ? <Esqueleto class="h-4 w-40" /> : resumen && <p class="m-0 text-[15px]">{resumen}</p>}
			<div class="mt-auto flex flex-wrap gap-2 pt-1">
				<a href={`#${seccion.ruta}`} class={claseBoton('secundario', 'px-3.5 text-[14.5px]')}>
					Editar
				</a>
			</div>
		</article>
	);
}
