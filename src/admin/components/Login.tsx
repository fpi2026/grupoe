/**
 * Inicio de sesión. Dos formas:
 * - Usuario y contraseña de práctica → modo demostración (no escribe en GitHub; ver lib/demo.ts).
 * - Token de acceso de GitHub (fase 1 del plan) → guarda en el repositorio y publica de verdad.
 */
import { useState } from 'preact/hooks';
import { TOKEN_GENERAL, entrarDemo, nombreDemo, salirDemo } from '../lib/demo';
import { clearToken, mensajeDeError, repo, setToken, verificarToken, type Permisos } from '../lib/github';
import { Aviso, Boton, campo } from './ui';

export function Login({ onEntrar }: { onEntrar: (p: Permisos) => void }) {
	return (
		<div class="mx-auto flex min-h-dvh max-w-[520px] flex-col justify-center gap-6 px-4 py-12">
			<div class="flex flex-col gap-2">
				<span class="eyebrow text-amber-ink">Panel de contenido</span>
				<h1 class="m-0 font-serif text-[clamp(34px,5vw,48px)] leading-[1.05] font-normal">Cabañas Alpinas El Limo</h1>
			</div>
			<LoginDemo onEntrar={onEntrar} />
			<details class="flex flex-col gap-4 text-sm">
				<summary class="cursor-pointer font-semibold text-ink">Entrar con un token personal de GitHub</summary>
				<div class="mt-4 flex flex-col gap-6">
					<LoginToken onEntrar={onEntrar} />
				</div>
			</details>
		</div>
	);
}

/** Usuario y contraseña de práctica: abre el panel en modo demostración. */
function LoginDemo({ onEntrar }: { onEntrar: (p: Permisos) => void }) {
	const [usuario, setUsuario] = useState('');
	const [clave, setClave] = useState('');
	const [error, setError] = useState('');
	const [enviando, setEnviando] = useState(false);

	async function entrar(e: Event) {
		e.preventDefault();
		setError('');
		if (!(await entrarDemo(usuario, clave))) return setError('Usuario o contraseña incorrectos.');
		if (!TOKEN_GENERAL) return onEntrar({ nombre: nombreDemo, escritura: true });
		// Con token general: comprobar que sigue vigente y que puede escribir
		setEnviando(true);
		try {
			const p = await verificarToken();
			if (p.escritura) return onEntrar({ nombre: nombreDemo, escritura: true });
			salirDemo();
			setError('El token general del panel no tiene permiso de escritura (Contents: lectura y escritura).');
		} catch (err) {
			setError(mensajeDeError(err)); // antes de cerrar la sesión: el mensaje depende de ella
			salirDemo();
		} finally {
			setEnviando(false);
		}
	}

	return (
		<form onSubmit={entrar} noValidate class="flex flex-col gap-4 rounded-lg border border-line bg-card p-6">
			<label class="flex flex-col gap-1.5 text-sm font-semibold">
				Usuario
				<input
					autoComplete="username"
					spellcheck={false}
					value={usuario}
					onInput={(e) => setUsuario(e.currentTarget.value)}
					aria-invalid={Boolean(error) || undefined}
					class={campo}
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold">
				Contraseña
				<input
					type="password"
					autoComplete="current-password"
					value={clave}
					onInput={(e) => setClave(e.currentTarget.value)}
					aria-invalid={Boolean(error) || undefined}
					class={campo}
				/>
			</label>
			{error && <Aviso tipo="error">{error}</Aviso>}
			<Boton type="submit" disabled={enviando}>
				{enviando ? 'Comprobando…' : 'Entrar'}
			</Boton>
			<p class="m-0 text-sm text-muted">
				{TOKEN_GENERAL
					? 'Acceso compartido del equipo: lo que guardes se publica en el sitio en 1 o 2 minutos.'
					: 'Modo demostración: puedes crear, editar y borrar noticias para practicar. Los cambios se guardan solo en este navegador y no se publican en el sitio.'}
			</p>
		</form>
	);
}

/** Token de acceso de GitHub: guarda en el repositorio y publica. */
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
		<>
			<form onSubmit={entrar} noValidate class="flex flex-col gap-4 rounded-lg border border-line bg-card p-6">
				<label class="flex flex-col gap-1.5 text-sm font-semibold">
					Token de acceso de GitHub
					<input
						type="password"
						autoComplete="off"
						spellcheck={false}
						value={token}
						onInput={(e) => setTok(e.currentTarget.value)}
						aria-invalid={Boolean(error) || undefined}
						class={`${campo} font-mono text-sm`}
					/>
				</label>
				{error && <Aviso tipo="error">{error}</Aviso>}
				<Boton type="submit" disabled={enviando}>
					{enviando ? 'Comprobando…' : 'Entrar'}
				</Boton>
				<p class="m-0 text-sm text-muted">
					El token se guarda solo en esta pestaña y se borra al cerrarla. Repositorio:{' '}
					<code>
						{repo.owner}/{repo.name}
					</code>
				</p>
			</form>
			<details class="text-sm text-muted">
				<summary class="cursor-pointer font-semibold text-ink">¿Cómo consigo un token?</summary>
				<ol class="mt-3 flex flex-col gap-1.5 pl-5">
					<li>
						En GitHub: <em>Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token</em>.
					</li>
					<li>
						<em>Resource owner</em>: la organización <code>{repo.owner}</code>. <em>Repository access</em>: solo <code>{repo.name}</code>.
					</li>
					<li>
						Permisos: <em>Contents</em> lectura y escritura; <em>Actions</em> solo lectura (para ver el estado de la publicación).
					</li>
					<li>Ponle fecha de vencimiento. Si la organización lo pide, un administrador debe aprobarlo.</li>
				</ol>
			</details>
		</>
	);
}
