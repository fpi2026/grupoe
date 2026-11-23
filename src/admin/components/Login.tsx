/**
 * Inicio de sesión (diseno/Panel-Login.dc.html). Tres formas de entrar:
 * - Usuario y contraseña compartidos (AdminAlpina) → publica con el token general; sin él, demostración.
 * - Token personal de GitHub → guarda en el repositorio y publica.
 * - «Practicar con la demostración» → nada sale del navegador (ver lib/demo.ts).
 */
import { useState } from 'preact/hooks';
import { TOKEN_GENERAL, entrarDemo, entrarPractica, nombreDemo, salirDemo } from '../lib/demo';
import { clearToken, mensajeDeError, repo, setToken, verificarToken, type Permisos } from '../lib/github';
import { Aviso, Girando, ayudaCampo, campo, claseBoton, etiquetaCampo } from './ui';

interface Props {
	onEntrar: (p: Permisos) => void;
	/** Foto de fondo (generada al compilar). */
	fondo: string;
	/** La sesión anterior se cerró porque el token dejó de valer. */
	vencida: boolean;
}

export function Login({ onEntrar, fondo, vencida }: Props) {
	const [usuario, setUsuario] = useState('');
	const [clave, setClave] = useState('');
	const [verClave, setVerClave] = useState(false);
	const [intentado, setIntentado] = useState(false);
	const [incorrecto, setIncorrecto] = useState(false);
	const [error, setError] = useState('');
	const [comprobando, setComprobando] = useState(false);

	const faltaUsuario = intentado && !usuario.trim();
	const faltaClave = intentado && !clave;

	async function entrar(e: Event) {
		e.preventDefault();
		setIntentado(true);
		setIncorrecto(false);
		setError('');
		if (!usuario.trim() || !clave) return;
		setComprobando(true);
		try {
			if (!(await entrarDemo(usuario, clave))) return setIncorrecto(true);
			if (!TOKEN_GENERAL) return onEntrar({ nombre: nombreDemo(), escritura: true });
			// Con token general: comprobar que sigue vigente y que puede escribir
			const p = await verificarToken();
			if (p.escritura) return onEntrar({ nombre: nombreDemo(), escritura: true });
			salirDemo();
			setError('El token general del panel no tiene permiso de escritura (Contents: lectura y escritura).');
		} catch (err) {
			setError(mensajeDeError(err)); // antes de cerrar la sesión: el mensaje depende de ella
			salirDemo();
		} finally {
			setComprobando(false);
		}
	}

	const practicar = (e: Event) => {
		e.preventDefault();
		entrarPractica();
		onEntrar({ nombre: nombreDemo(), escritura: true });
	};

	return (
		<main class="grid min-h-dvh grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]">
			<div class="relative min-h-[200px] bg-surface">
				<img src={fondo} alt="" class="absolute inset-0 size-full object-cover" />
				<div aria-hidden="true" class="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,12,9,.7),rgba(8,12,9,0)_60%)]" />
				<div class="absolute bottom-[clamp(20px,4vw,48px)] left-[clamp(20px,4vw,48px)] flex items-center gap-3 text-[#F6F2E8]">
					<svg width="30" height="38" viewBox="0 0 40 48" aria-hidden="true">
						<path d="M20.5 2 L3 46" style="stroke:#F6F2E8;stroke-width:1.6;fill:none" />
						<path d="M19 2 H23.5 L38 46 H30.5 Z" style="fill:#F6F2E8" />
					</svg>
					<span class="flex flex-col leading-[1.15]">
						<span class="text-sm font-bold tracking-[.16em]">CABAÑAS ALPINAS</span>
						<span class="text-xs tracking-[.06em] opacity-90">El Limo, Metapán</span>
					</span>
				</div>
			</div>

			<div class="flex items-center px-[clamp(20px,5vw,72px)] py-[clamp(28px,6vw,80px)]">
				<div class="flex w-full max-w-[420px] flex-col gap-6">
					<div class="flex flex-col gap-2">
						<span class="text-[12.5px] font-semibold tracking-[.16em] text-amber-ink uppercase">Panel de contenido</span>
						<h1 class="m-0 font-serif text-[clamp(36px,4vw,52px)] leading-[1.02] font-normal tracking-[-.01em]">
							Entrar <em class="font-light">al panel</em>
						</h1>
						<p class="m-0 text-muted">Aquí se editan las noticias, fotos y textos del sitio.</p>
					</div>

					{incorrecto && (
						<Aviso tipo="error">
							<strong>Usuario o contraseña incorrectos.</strong> Revisa las mayúsculas y vuelve a intentar.
						</Aviso>
					)}
					{error && <Aviso tipo="error">{error}</Aviso>}
					{vencida && !incorrecto && !error && (
						<Aviso tipo="warn">
							<strong>Tu sesión se cerró</strong> porque el acceso a GitHub dejó de valer. Vuelve a entrar para seguir trabajando.
						</Aviso>
					)}

					<form onSubmit={entrar} noValidate class="flex flex-col gap-4">
						<label class="flex flex-col gap-1.5">
							<span class={etiquetaCampo}>Usuario</span>
							<input
								name="usuario"
								autoComplete="username"
								spellcheck={false}
								value={usuario}
								onInput={(e) => setUsuario(e.currentTarget.value)}
								aria-invalid={faltaUsuario || incorrecto || undefined}
								aria-describedby="u-err"
								class={`${campo} min-h-12`}
							/>
							{faltaUsuario && (
								<span id="u-err" class="text-sm font-semibold text-danger">
									Escribe tu usuario.
								</span>
							)}
						</label>
						<label class="flex flex-col gap-1.5">
							<span class={etiquetaCampo}>Contraseña</span>
							<span class="relative flex">
								<input
									name="clave"
									type={(verClave ? 'text' : 'password') as 'password'}
									autoComplete="current-password"
									value={clave}
									onInput={(e) => setClave(e.currentTarget.value)}
									aria-invalid={faltaClave || incorrecto || undefined}
									aria-describedby="p-err"
									class={`${campo} min-h-12 pr-[92px]`}
								/>
								<button
									type="button"
									onClick={() => setVerClave(!verClave)}
									aria-pressed={verClave}
									class="absolute inset-y-0.5 right-0.5 cursor-pointer border-0 bg-transparent px-3 text-sm font-semibold text-forest"
								>
									{verClave ? 'Ocultar' : 'Mostrar'}
								</button>
							</span>
							{faltaClave && (
								<span id="p-err" class="text-sm font-semibold text-danger">
									Escribe tu contraseña.
								</span>
							)}
						</label>
						<button
							type="submit"
							disabled={comprobando}
							aria-busy={comprobando}
							class="flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-sm border-0 bg-btn px-[22px] text-base font-semibold text-btn-ink hover:brightness-110 disabled:opacity-70"
						>
							<span>{comprobando ? 'Comprobando…' : 'Entrar'}</span>
							{comprobando ? <Girando /> : <span aria-hidden="true">→</span>}
						</button>
						{!TOKEN_GENERAL && (
							<p class={`m-0 ${ayudaCampo}`}>Esta copia del panel no tiene token general: con el usuario compartido entrarás en modo demostración.</p>
						)}
					</form>

					<LoginToken onEntrar={onEntrar} />

					<a href="#/" onClick={practicar} class="flex min-h-11 items-center self-start text-[15px] font-semibold">
						Practicar con la demostración →
					</a>
				</div>
			</div>
		</main>
	);
}

/** Token personal de GitHub: guarda en el repositorio y publica. */
function LoginToken({ onEntrar }: { onEntrar: (p: Permisos) => void }) {
	const [token, setTok] = useState('');
	const [error, setError] = useState('');
	const [enviando, setEnviando] = useState(false);

	async function entrar(e: Event) {
		e.preventDefault();
		if (!token.trim()) return setError('Pega tu token de GitHub.');
		setEnviando(true);
		setError('');
		setToken(token.trim());
		try {
			const p = await verificarToken();
			if (!p.escritura) {
				clearToken();
				setError('El token puede leer el repositorio, pero no escribir en él. Dale permiso de lectura y escritura en Contents.');
			} else onEntrar(p);
		} catch (err) {
			clearToken();
			setError(mensajeDeError(err));
		} finally {
			setEnviando(false);
		}
	}

	return (
		<details class="border-t border-line pt-3">
			<summary class="flex min-h-11 cursor-pointer items-center text-[15px] font-semibold text-muted">Entrar con un token de GitHub</summary>
			<form onSubmit={entrar} noValidate class="flex flex-col gap-2.5 pt-2">
				<p class={`m-0 ${ayudaCampo}`}>
					Solo para administración. El token se guarda solo en esta pestaña y se borra al cerrarla. Debe ser <em>fine-grained</em>, del repositorio{' '}
					<code>
						{repo.owner}/{repo.name}
					</code>
					, con <em>Contents</em> de lectura y escritura y <em>Actions</em> de lectura.
				</p>
				<label class="flex flex-col gap-1.5">
					<span class={etiquetaCampo}>Token</span>
					<input
						type="password"
						autoComplete="off"
						spellcheck={false}
						placeholder="github_pat_…"
						value={token}
						onInput={(e) => setTok(e.currentTarget.value)}
						aria-invalid={Boolean(error) || undefined}
						aria-describedby="t-err"
						class={`${campo} min-h-12 font-mono text-[15px]`}
					/>
				</label>
				{error && (
					<span id="t-err" class="text-sm font-semibold text-danger">
						{error}
					</span>
				)}
				<button type="submit" disabled={enviando} class={claseBoton('contorno', 'self-start')}>
					{enviando && <Girando />}
					{enviando ? 'Comprobando…' : 'Entrar con token'}
				</button>
			</form>
		</details>
	);
}
