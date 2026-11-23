/**
 * Panel de contenido /admin (Plan del sitio: "Arquitectura del CMS con axios").
 * Rutas con hash: #/ tablero · #/noticias · #/noticias/nueva · #/noticias/editar/<slug>
 */
import { useCallback, useEffect, useState } from 'preact/hooks';
import { Login } from './components/Login';
import { Tablero } from './components/Tablero';
import { ListaNoticias } from './components/ListaNoticias';
import { EditorNoticia } from './components/EditorNoticia';
import { Aviso, Cargando } from './components/ui';
import { clearToken, getToken, mensajeDeError, repo, verificarToken, type Permisos } from './lib/github';
import { esDemo, nombreDemo, restablecerDemo, salirDemo } from './lib/demo';
import { cargarNoticias, type Repo } from './lib/noticias';

const leerRuta = () => location.hash.replace(/^#/, '') || '/';

export default function App() {
	const [sesion, setSesion] = useState<Permisos | null | undefined>(undefined);
	const [ruta, setRuta] = useState(leerRuta);
	const [datos, setDatos] = useState<Repo | null>(null);
	const [error, setError] = useState('');
	const [aviso, setAviso] = useState('');
	/** Cambia en cada lectura del repositorio: reinicia el editor con los datos nuevos. */
	const [version, setVersion] = useState(0);
	const [confirmarRestablecer, setConfirmarRestablecer] = useState(false);

	// Retomar la sesión si sigue abierta en esta pestaña (demostración o token)
	useEffect(() => {
		if (esDemo()) return setSesion({ nombre: nombreDemo, escritura: true });
		if (!getToken()) return setSesion(null);
		verificarToken()
			.then((p) => setSesion(p.escritura ? p : null))
			.catch(() => {
				clearToken();
				setSesion(null);
			});
	}, []);

	useEffect(() => {
		const cambiar = () => {
			setRuta(leerRuta());
			window.scrollTo(0, 0);
		};
		window.addEventListener('hashchange', cambiar);
		return () => window.removeEventListener('hashchange', cambiar);
	}, []);

	const recargar = useCallback(async () => {
		setError('');
		try {
			setDatos(await cargarNoticias());
			setVersion((v) => v + 1);
		} catch (e) {
			setError(mensajeDeError(e));
		}
	}, []);

	useEffect(() => {
		if (sesion) recargar();
	}, [sesion, recargar]);

	// El aviso de "guardado" se oculta solo después de unos segundos
	useEffect(() => {
		if (!aviso) return;
		const t = setTimeout(() => setAviso(''), 12_000);
		return () => clearTimeout(t);
	}, [aviso]);

	if (sesion === undefined) return <div class="p-8"><Cargando texto="Comprobando sesión…" /></div>;
	if (sesion === null) return <Login onEntrar={setSesion} />;

	const salir = () => {
		clearToken();
		salirDemo();
		setDatos(null);
		setSesion(null);
		location.hash = '';
	};

	const restablecer = async () => {
		if (!confirmarRestablecer) return setConfirmarRestablecer(true);
		setConfirmarRestablecer(false);
		restablecerDemo();
		setAviso('Demostración restablecida: el panel vuelve a mostrar el contenido del sitio publicado.');
		location.hash = '#/';
		await recargar();
	};

	const listo = async (mensaje: string) => {
		setAviso(mensaje);
		location.hash = '#/noticias';
		await recargar();
	};

	const editar = /^\/noticias\/editar\/([a-z0-9-]+)$/.exec(ruta);
	let pantalla;
	if (ruta === '/') pantalla = <Tablero datos={datos} />;
	else if (!datos) pantalla = error ? null : <Cargando texto="Cargando noticias…" />;
	else if (ruta === '/noticias') pantalla = <ListaNoticias datos={datos} onRecargar={recargar} />;
	else if (ruta === '/noticias/nueva') pantalla = <EditorNoticia key={`nueva-${version}`} datos={datos} slug={null} onListo={listo} onRecargar={recargar} />;
	else if (editar) pantalla = <EditorNoticia key={`${editar[1]}-${version}`} datos={datos} slug={editar[1]!} onListo={listo} onRecargar={recargar} />;
	else pantalla = <Aviso tipo="error">Esta pantalla no existe. <a href="#/">Ir al tablero</a></Aviso>;

	const nav = [
		{ href: '#/', texto: 'Tablero', activa: ruta === '/' },
		{ href: '#/noticias', texto: 'Noticias', activa: ruta.startsWith('/noticias') },
	];

	return (
		<div class="min-h-dvh">
			<header class="border-b border-line bg-bg">
				<div class="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-4 py-3">
					<div class="flex flex-wrap items-center gap-6">
						<span class="font-serif text-xl">Panel · El Limo</span>
						<nav aria-label="Panel">
							<ul class="m-0 flex list-none gap-1 p-0">
								{nav.map((l) => (
									<li key={l.href}>
										<a
											href={l.href}
											aria-current={l.activa ? 'page' : undefined}
											class="rounded-sm px-3 py-2 font-semibold text-ink no-underline hover:bg-surface aria-[current=page]:bg-surface"
										>
											{l.texto}
										</a>
									</li>
								))}
							</ul>
						</nav>
					</div>
					<div class="flex flex-wrap items-center gap-4 text-sm">
						<span class="text-muted">{sesion.nombre}</span>
						<a href={import.meta.env.BASE_URL} target="_blank" rel="noopener" class="font-semibold">
							Ver sitio ↗
						</a>
						<button type="button" onClick={salir} class="font-semibold text-ink underline underline-offset-4">
							Cerrar sesión
						</button>
					</div>
				</div>
			</header>
			<main id="panel" class="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8">
				{esDemo() && (
					<Aviso tipo="info">
						<strong>Modo demostración.</strong> Los cambios se guardan solo en este navegador: no llegan al repositorio ni al sitio, y la
						publicación del tablero es simulada.{' '}
						<button type="button" onClick={restablecer} class="font-semibold underline">
							{confirmarRestablecer ? '¿Seguro? Se borran todos los cambios de prueba' : 'Restablecer demostración'}
						</button>
					</Aviso>
				)}
				{aviso && <Aviso tipo="ok">{aviso}</Aviso>}
				{error && (
					<Aviso tipo="error">
						{error}{' '}
						<button type="button" onClick={recargar} class="font-semibold underline">
							Reintentar
						</button>
					</Aviso>
				)}
				{pantalla}
			</main>
			<footer class="mx-auto max-w-[1100px] px-4 pb-8 text-xs text-muted">
				{esDemo()
					? 'Demostración: nada de lo que guardes aquí cambia el sitio.'
					: `Cada guardado es un commit en ${repo.owner}/${repo.name} (${repo.branch}).`}
			</footer>
		</div>
	);
}
