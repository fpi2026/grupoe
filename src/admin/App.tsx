/**
 * Panel de contenido /admin (Plan del sitio: "Arquitectura del CMS con axios"; diseño: diseno/Panel-*.dc.html).
 * Rutas con hash: #/ tablero · #/noticias · #/noticias/nueva · #/noticias/editar/<slug>
 */
import { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Login } from './components/Login';
import { Marco } from './components/Marco';
import { Tablero } from './components/Tablero';
import { ListaNoticias } from './components/ListaNoticias';
import { EditorNoticia } from './components/EditorNoticia';
import { Reconocimientos } from './components/Reconocimientos';
import { Gastronomia } from './components/Gastronomia';
import { Textos } from './components/Textos';
import { Experiencias } from './components/Experiencias';

/** Pantallas que editan un JSON de src/content/datos/ (ruta → componente). */
const DOCUMENTOS = {
	'/reconocimientos': Reconocimientos,
	'/experiencias': Experiencias,
	'/gastronomia': Gastronomia,
	'/textos': Textos,
} as const;
import { Aviso, Cargando, avisar, claseBoton, contenedor } from './components/ui';
import { clearToken, getToken, mensajeDeError, verificarToken, type Permisos } from './lib/github';
import { esDemo, nombreDemo, restablecerDemo, salirDemo, sesionSinToken } from './lib/demo';
import { cargarNoticias, type Repo } from './lib/noticias';
import { olvidarPublicacion, seguirPublicacion } from './lib/publicacion';
import { salidaBloqueada } from './lib/salida';

const leerRuta = () => location.hash.replace(/^#/, '') || '/';

export default function App({ fondoLogin }: { fondoLogin: string }) {
	const [sesion, setSesion] = useState<Permisos | null | undefined>(undefined);
	const [vencida, setVencida] = useState(false);
	const [ruta, setRuta] = useState(leerRuta);
	const [datos, setDatos] = useState<Repo | null>(null);
	const [error, setError] = useState('');
	/** Cambia en cada lectura del repositorio: reinicia el editor con los datos nuevos. */
	const [version, setVersion] = useState(0);
	const rutaActual = useRef(ruta);

	const salir = useCallback((porVencimiento = false) => {
		clearToken();
		salirDemo();
		olvidarPublicacion();
		setDatos(null);
		setVencida(porVencimiento);
		setSesion(null);
		history.replaceState(null, '', location.pathname);
		rutaActual.current = '/';
		setRuta('/');
	}, []);

	// Retomar la sesión si sigue abierta en esta pestaña (compartida, demostración o token)
	useEffect(() => {
		if (sesionSinToken()) return setSesion({ nombre: nombreDemo(), escritura: true });
		if (!getToken()) return setSesion(null);
		verificarToken()
			.then((p) => (p.escritura ? setSesion(p) : salir(true)))
			.catch(() => salir(true));
	}, []);

	useEffect(() => {
		const cambiar = () => {
			const nueva = leerRuta();
			if (nueva === rutaActual.current) return;
			// Cambios sin guardar en el editor: volver a la ruta anterior y dejar que avise
			if (salidaBloqueada(nueva)) {
				history.replaceState(null, '', `#${rutaActual.current}`);
				return;
			}
			rutaActual.current = nueva;
			setRuta(nueva);
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
			if (e instanceof AxiosError && e.response?.status === 401 && !sesionSinToken()) return salir(true);
			setError(mensajeDeError(e));
		}
	}, [salir]);

	useEffect(() => {
		if (sesion) recargar();
	}, [sesion, recargar]);

	if (sesion === undefined)
		return (
			<div class="p-8">
				<Cargando texto="Comprobando sesión…" />
			</div>
		);
	if (sesion === null)
		return (
			<Login
				fondo={fondoLogin}
				vencida={vencida}
				onEntrar={(p) => {
					setVencida(false);
					setSesion(p);
				}}
			/>
		);

	const restablecer = async () => {
		restablecerDemo();
		olvidarPublicacion();
		seguirPublicacion();
		avisar({ tipo: 'info', titulo: 'Demostración restablecida.', texto: 'Todo volvió al contenido del sitio publicado.' });
		location.hash = '#/';
		await recargar();
	};

	/** Después de guardar: seguir la publicación del commit y abrir la versión guardada. */
	const guardado = async (slug: string, sha: string) => {
		if (!esDemo()) seguirPublicacion(sha);
		else seguirPublicacion();
		await recargar();
		const destino = `/noticias/editar/${slug}`;
		if (rutaActual.current !== destino) location.hash = `#${destino}`;
	};

	const borrado = async (sha: string) => {
		if (!esDemo()) seguirPublicacion(sha);
		else seguirPublicacion();
		location.hash = '#/noticias';
		await recargar();
	};

	/** Después de guardar una sección en JSON: seguir la publicación y recargar. */
	const seccionGuardada = async (sha: string) => {
		seguirPublicacion(esDemo() ? undefined : sha);
		await recargar();
	};

	const editar = /^\/noticias\/editar\/([a-z0-9-]+)$/.exec(ruta);
	const esEditor = ruta === '/noticias/nueva' || Boolean(editar) || ruta in DOCUMENTOS;
	let pantalla;
	if (ruta === '/') pantalla = <Tablero datos={datos} nombre={sesion.nombre} />;
	else if (ruta === '/noticias') pantalla = <ListaNoticias datos={datos} />;
	else if (ruta in DOCUMENTOS) {
		const Documento = DOCUMENTOS[ruta as keyof typeof DOCUMENTOS];
		pantalla = <Documento key={`${ruta}-${version}`} repo={datos} onGuardado={seccionGuardada} />;
	}
	else if (!datos) pantalla = error ? null : <div class={contenedor}><Cargando texto="Cargando noticias…" /></div>;
	else if (ruta === '/noticias/nueva')
		pantalla = <EditorNoticia key={`nueva-${version}`} datos={datos} slug={null} onGuardado={guardado} onBorrado={borrado} onRecargar={recargar} />;
	else if (editar)
		pantalla = <EditorNoticia key={`${editar[1]}-${version}`} datos={datos} slug={editar[1]!} onGuardado={guardado} onBorrado={borrado} onRecargar={recargar} />;
	else
		pantalla = (
			<div class={contenedor}>
				<Aviso tipo="error">
					Esta pantalla no existe. <a href="#/">Ir al tablero</a>
				</Aviso>
			</div>
		);

	return (
		<Marco ruta={ruta} nombre={sesion.nombre} demo={esDemo()} onSalir={() => salir()} onRestablecer={restablecer}>
			<main
				id="contenido"
				tabIndex={-1}
				class={`flex flex-col outline-none ${esEditor ? 'min-h-[calc(100dvh-120px)] pt-[clamp(20px,3vw,40px)] pb-(--panel-nav-h)' : 'pt-[clamp(24px,4vw,48px)] pb-[calc(56px+var(--panel-nav-h))]'}`}
			>
				{error && (
					<div class={`${contenedor} pb-6`}>
						<Aviso tipo="error">
							{error}{' '}
							<button type="button" onClick={recargar} class={claseBoton('secundario', 'ml-2 min-h-9 bg-card')}>
								Reintentar
							</button>
						</Aviso>
					</div>
				)}
				{pantalla}
			</main>
		</Marco>
	);
}
