/** Inicio de sesión con un token de acceso de GitHub (fase 1 del plan). */
import { useState } from 'preact/hooks';
import { clearToken, mensajeDeError, repo, setToken, verificarToken, type Permisos } from '../lib/github';
import { Aviso, Boton, campo } from './ui';

export function Login({ onEntrar }: { onEntrar: (p: Permisos) => void }) {
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
		<div class="mx-auto flex min-h-dvh max-w-[520px] flex-col justify-center gap-6 px-4 py-12">
			<div class="flex flex-col gap-2">
				<span class="eyebrow text-amber-ink">Panel de contenido</span>
				<h1 class="m-0 font-serif text-[clamp(34px,5vw,48px)] leading-[1.05] font-normal">Cabañas Alpinas El Limo</h1>
			</div>
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
		</div>
	);
}
