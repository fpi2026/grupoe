/** Piezas de interfaz compartidas del panel. */
import type { ButtonHTMLAttributes, ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { leerBlob } from '../lib/github';
import { rutaPortada } from '../lib/noticias';

export const campo =
	'w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-base text-ink aria-invalid:border-[#B23A2A] focus-visible:outline-2 focus-visible:outline-forest';

export function Boton({
	variante = 'primario',
	class: cls = '',
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'peligro' }) {
	const estilos = {
		primario: 'bg-btn text-btn-ink border-transparent hover:brightness-110',
		secundario: 'bg-transparent text-ink border-line hover:border-ink',
		peligro: 'bg-transparent text-[#B23A2A] border-[#B23A2A] hover:bg-[#B23A2A] hover:text-white',
	}[variante];
	return (
		<button
			type="button"
			{...props}
			class={`inline-flex h-11 items-center justify-center gap-2 rounded-sm border px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${estilos} ${cls}`}
		/>
	);
}

export function Aviso({ tipo, children }: { tipo: 'error' | 'ok' | 'info'; children: ComponentChildren }) {
	const estilos = {
		error: 'border-[#B23A2A] bg-[color-mix(in_oklab,#B23A2A_8%,transparent)]',
		ok: 'border-forest bg-[color-mix(in_oklab,var(--color-forest)_10%,transparent)]',
		info: 'border-amber bg-[color-mix(in_oklab,var(--color-amber)_10%,transparent)]',
	}[tipo];
	return (
		<p role={tipo === 'error' ? 'alert' : 'status'} class={`m-0 rounded-md border px-4 py-3 ${estilos}`}>
			{children}
		</p>
	);
}

export function Etiqueta({ children, tono = 'neutro' }: { children: ComponentChildren; tono?: 'neutro' | 'verde' | 'ambar' | 'rojo' }) {
	const estilos = {
		neutro: 'border-line text-muted',
		verde: 'border-forest text-forest',
		ambar: 'border-amber text-amber-ink',
		rojo: 'border-[#B23A2A] text-[#B23A2A]',
	}[tono];
	return <span class={`inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-semibold ${estilos}`}>{children}</span>;
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
	return (
		<p role="status" class="m-0 text-muted">
			{texto}
		</p>
	);
}

// Imágenes del repositorio: se piden una vez por sha y se guardan como URL de objeto
const cache = new Map<string, Promise<string>>();

/** Muestra una portada guardada en el repositorio. */
export function PortadaRepo({ portada, archivos, class: cls = '' }: { portada: string; archivos: Map<string, string>; class?: string }) {
	const [url, setUrl] = useState<string | null>(null);
	useEffect(() => {
		const sha = archivos.get(rutaPortada(portada));
		if (!sha) return setUrl(null);
		const tipo = portada.endsWith('.webp') ? 'image/webp' : portada.endsWith('.png') ? 'image/png' : 'image/jpeg';
		if (!cache.has(sha)) cache.set(sha, leerBlob(sha, tipo).then((b) => URL.createObjectURL(b)));
		let vivo = true;
		cache.get(sha)!.then((u) => vivo && setUrl(u)).catch(() => vivo && setUrl(null));
		return () => {
			vivo = false;
		};
	}, [portada, archivos]);
	return url ? <img src={url} alt="" class={`object-cover ${cls}`} /> : <div class={`bg-surface ${cls}`} aria-hidden="true" />;
}
