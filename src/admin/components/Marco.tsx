/**
 * Marco común del panel (diseno/PanelMarco.dc.html): franja de demostración, encabezado con
 * insignia de publicación, tema día/noche, navegación por secciones, barra inferior en móvil
 * y avisos flotantes.
 */
import type { ComponentChildren, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { Publicacion } from '../lib/github';
import { usePublicacion } from '../lib/publicacion';
import { AvisosFlotantes, Girando } from './ui';

/** Secciones con pantalla terminada. Las demás (fase 5) se agregan aquí al construirlas. */
const SECCIONES = [
	{ id: 'tablero', href: '#/', texto: 'Tablero', activa: (r: string) => r === '/' },
	{ id: 'noticias', href: '#/noticias', texto: 'Noticias', activa: (r: string) => r.startsWith('/noticias') },
] as const;

const PUB: Record<Publicacion['estado'], { texto: string; clase: string }> = {
	'en-cola': { texto: 'En cola', clase: 'bg-warn-bg text-warn' },
	publicando: { texto: 'Publicando…', clase: 'bg-warn-bg text-warn' },
	'en-linea': { texto: 'Sitio al día', clase: 'bg-ok-bg text-ok' },
	fallo: { texto: 'Falló la publicación', clase: 'bg-danger-bg text-danger' },
	cancelada: { texto: 'Publicación cancelada', clase: 'bg-neutral-bg text-neutral' },
};

const icono = (hijos: JSX.Element[]) => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		{hijos}
	</svg>
);

const ICONOS: Record<string, JSX.Element> = {
	tablero: icono([
		<rect x="3" y="3" width="7" height="9" rx="1" />,
		<rect x="14" y="3" width="7" height="5" rx="1" />,
		<rect x="14" y="12" width="7" height="9" rx="1" />,
		<rect x="3" y="16" width="7" height="5" rx="1" />,
	]),
	noticias: icono([
		<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />,
		<path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />,
	]),
	mas: icono([<path d="M4 6h16M4 12h16M4 18h16" />]),
};

interface Props {
	ruta: string;
	nombre: string;
	demo: boolean;
	onSalir: () => void;
	onRestablecer: () => void;
	children: ComponentChildren;
}

export function Marco({ ruta, nombre, demo, onSalir, onRestablecer, children }: Props) {
	const [menu, setMenu] = useState(false);
	const { pub } = usePublicacion();
	const sitio = import.meta.env.BASE_URL;

	// El menú móvil se cierra al cambiar de pantalla o con Escape
	useEffect(() => setMenu(false), [ruta]);
	useEffect(() => {
		if (!menu) return;
		const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
		window.addEventListener('keydown', esc);
		return () => window.removeEventListener('keydown', esc);
	}, [menu]);

	const cambiarTema = () => {
		const d = document.documentElement;
		const v = d.dataset.theme === 'night' ? 'day' : 'night';
		d.dataset.theme = v;
		try {
			localStorage.setItem('cael-theme', v);
		} catch {}
	};

	const saltar = (e: Event) => {
		e.preventDefault(); // la navegación usa el hash: no cambiarlo
		document.getElementById('contenido')?.focus();
	};

	const p = pub ? PUB[pub.estado] : null;

	return (
		<div class="min-h-dvh">
			<a
				href="#contenido"
				onClick={saltar}
				class="absolute top-2 -left-[9999px] z-100 rounded-sm bg-btn px-4 py-3 font-semibold text-btn-ink focus:left-3"
			>
				Saltar al contenido
			</a>

			{demo && (
				<div role="note" class="border-b border-line bg-warn-bg text-ink">
					<div class="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-4 gap-y-2 px-[clamp(16px,3vw,40px)] py-1.5 text-sm">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" class="flex-none text-warn">
							<path d="M9 3h6M10 3v6L4 20h16L14 9V3" />
						</svg>
						<span class="flex-[1_1_220px]">
							<strong>Modo demostración.</strong> Puedes practicar: nada de lo que guardes se publica en el sitio.
						</span>
						<div class="flex gap-1">
							<button
								type="button"
								onClick={onRestablecer}
								class="min-h-9 cursor-pointer rounded-sm border border-warn bg-transparent px-3 text-[13.5px] font-semibold text-warn hover:bg-card"
							>
								Restablecer demostración
							</button>
							<button type="button" onClick={onSalir} class="min-h-9 cursor-pointer border-0 bg-transparent px-2.5 text-[13.5px] font-medium text-ink underline hover:text-warn">
								Salir
							</button>
						</div>
					</div>
				</div>
			)}

			<header class="sticky top-0 z-40 border-b border-line bg-bg">
				<div class="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-[clamp(16px,3vw,40px)] py-2.5">
					<a href="#/" aria-label="Panel de Cabañas Alpinas, ir al tablero" class="flex min-h-11 items-center gap-2.5 text-ink no-underline hover:text-ink">
						<svg width="24" height="30" viewBox="0 0 40 48" aria-hidden="true">
							<path d="M20.5 2 L3 46" style="stroke:var(--forest);stroke-width:1.8;fill:none" />
							<path d="M19 2 H23.5 L38 46 H30.5 Z" style="fill:var(--forest)" />
						</svg>
						<span class="text-[13px] leading-[1.1] font-bold tracking-[.14em]">
							CABAÑAS
							<br />
							ALPINAS
						</span>
						<span class="border-l border-line pl-2.5 font-serif text-[22px] leading-none italic">Panel</span>
					</a>

					<div class="flex items-center gap-2">
						{p && (
							<a
								href="#/"
								title="Estado de la publicación del sitio"
								class={`inline-flex min-h-10 items-center gap-2 rounded-pill px-3 text-[13.5px] font-semibold no-underline hover:opacity-90 ${p.clase}`}
							>
								{pub!.estado === 'publicando' ? <Girando class="size-3" /> : <span aria-hidden="true" class="size-[9px] rounded-full bg-current" />}
								<span class="max-[480px]:sr-only">{p.texto}</span>
							</a>
						)}
						<button
							type="button"
							onClick={cambiarTema}
							aria-label="Cambiar entre tema día y noche"
							title="Día / Noche"
							class="flex size-11 cursor-pointer items-center justify-center rounded-sm border border-line bg-transparent text-ink hover:border-ink"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="display:var(--is-day)">
								<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
							</svg>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="display:var(--is-night)">
								<circle cx="12" cy="12" r="4" />
								<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
							</svg>
						</button>
						<div class="flex items-center gap-1 max-[820px]:hidden">
							<span class="flex flex-col pr-2.5 pl-1.5 text-[13px] leading-[1.15]">
								<span class="text-muted">Sesión</span>
								<strong>{nombre}</strong>
							</span>
							<a href={sitio} target="_blank" rel="noopener" class="inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-semibold no-underline hover:bg-surface">
								Ver sitio ↗
							</a>
							<button type="button" onClick={onSalir} class="inline-flex min-h-11 cursor-pointer items-center rounded-sm border-0 bg-transparent px-3 text-sm text-ink hover:bg-surface">
								Cerrar sesión
							</button>
						</div>
						<button
							type="button"
							onClick={() => setMenu(!menu)}
							aria-expanded={menu}
							aria-controls="panel-menu"
							class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-sm border border-line bg-transparent px-3 text-sm font-semibold text-ink max-[480px]:hidden min-[821px]:hidden"
						>
							{ICONOS.mas}Menú
						</button>
					</div>
				</div>

				<nav aria-label="Secciones del panel" class="mx-auto max-w-[1280px] overflow-x-auto px-[clamp(16px,3vw,40px)] max-[820px]:hidden">
					<ul class="m-0 flex list-none gap-1 p-0 whitespace-nowrap">
						{SECCIONES.map((s) => (
							<li key={s.id}>
								<a
									href={s.href}
									aria-current={s.activa(ruta) ? 'page' : undefined}
									class="flex min-h-11 items-center border-b-2 border-transparent px-3 text-[14.5px] font-medium text-ink no-underline hover:bg-surface hover:text-amber-ink aria-[current=page]:border-amber aria-[current=page]:font-bold"
								>
									{s.texto}
								</a>
							</li>
						))}
					</ul>
				</nav>
			</header>

			{menu && (
				<div id="panel-menu" class="fixed inset-0 z-45 flex flex-col min-[821px]:hidden">
					<div onClick={() => setMenu(false)} class="absolute inset-0 bg-[rgba(10,14,11,.45)]" />
					<nav
						aria-label="Secciones del panel"
						class="relative mt-auto flex max-h-[85vh] flex-col gap-1 overflow-auto rounded-t-lg border-t border-line bg-bg px-4 pt-3 pb-[calc(80px+env(safe-area-inset-bottom))]"
					>
						<div class="flex items-center justify-between pt-1 pb-2">
							<span class="text-[13px] text-muted">
								Sesión: <strong class="text-ink">{nombre}</strong>
							</span>
							<button type="button" onClick={() => setMenu(false)} aria-label="Cerrar menú" class="size-11 cursor-pointer border-0 bg-transparent text-[22px] text-ink">
								×
							</button>
						</div>
						{SECCIONES.map((s) => (
							<a
								key={s.id}
								href={s.href}
								aria-current={s.activa(ruta) ? 'page' : undefined}
								class="flex min-h-12 items-center rounded-sm px-3 text-[17px] font-medium text-ink no-underline aria-[current=page]:bg-surface aria-[current=page]:font-bold"
							>
								{s.texto}
							</a>
						))}
						<div class="mt-2 flex gap-2 border-t border-line pt-3">
							<a href={sitio} target="_blank" rel="noopener" class="flex min-h-12 flex-1 items-center rounded-sm border border-line px-3.5 font-semibold no-underline">
								Ver sitio ↗
							</a>
							<button type="button" onClick={onSalir} class="flex min-h-12 flex-1 cursor-pointer items-center rounded-sm border border-line bg-transparent px-3.5 text-base text-ink">
								Cerrar sesión
							</button>
						</div>
					</nav>
				</div>
			)}

			{/* Barra inferior en móvil */}
			<nav aria-label="Accesos rápidos" class="fixed inset-x-0 bottom-0 z-46 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] min-[821px]:hidden">
				<ul class="m-0 grid list-none grid-cols-3 p-0">
					{SECCIONES.map((s) => (
						<li key={s.id}>
							<a
								href={s.href}
								aria-current={s.activa(ruta) ? 'page' : undefined}
								class="flex h-[62px] flex-col items-center justify-center gap-[3px] border-t-2 border-transparent text-[11.5px] font-medium text-ink no-underline aria-[current=page]:border-amber aria-[current=page]:font-bold aria-[current=page]:text-forest"
							>
								{ICONOS[s.id]}
								<span>{s.texto}</span>
							</a>
						</li>
					))}
					<li>
						<button
							type="button"
							onClick={() => setMenu(!menu)}
							aria-expanded={menu}
							aria-controls="panel-menu"
							class="flex h-[62px] w-full cursor-pointer flex-col items-center justify-center gap-[3px] border-0 border-t-2 border-transparent bg-transparent text-[11.5px] font-medium text-ink"
						>
							{ICONOS.mas}
							<span>Más</span>
						</button>
					</li>
				</ul>
			</nav>

			<AvisosFlotantes />
			{children}
		</div>
	);
}
