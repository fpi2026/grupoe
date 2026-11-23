/**
 * Selector de foto (diseno/SelectorFoto.dc.html): vista previa, «Foto pendiente», reducción a
 * 1600 px y WebP en el navegador con el peso final. La foto se sube al guardar.
 */
import { useState } from 'preact/hooks';
import { comprimirImagen, tamano, type ImagenReducida } from '../lib/imagen';
import { Boton, Girando } from './ui';

export interface FotoNueva extends ImagenReducida {
	url: string;
	pesoOriginal: number;
}

interface Props {
	etiqueta: string;
	/** URL de la foto actual (null = no hay). */
	src: string | null;
	/** Proporción de la vista previa, por ejemplo «3/2». */
	proporcion?: string;
	/** Texto del espacio vacío. */
	textoPendiente?: string;
	error?: string;
	/** Foto elegida y reducida, lista para subir al guardar. */
	onFoto: (f: FotoNueva) => void;
	/** Sin esta función no se ofrece «Quitar foto». */
	onQuitar?: () => void;
	id?: string;
}

export function SelectorFoto({ etiqueta, src, proporcion = '4/3', textoPendiente, error, onFoto, onQuitar, id = 'foto' }: Props) {
	const [reduciendo, setReduciendo] = useState(false);
	const [info, setInfo] = useState('');
	const [problema, setProblema] = useState('');
	const [confirmarQuitar, setConfirmarQuitar] = useState(false);

	async function elegir(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const archivo = input.files?.[0];
		input.value = '';
		if (!archivo) return;
		setReduciendo(true);
		setInfo('');
		setProblema('');
		try {
			const r = await comprimirImagen(archivo);
			onFoto({ ...r, url: URL.createObjectURL(r.blob), pesoOriginal: archivo.size });
			setInfo(`Lista · ${r.ancho} × ${r.alto} px · WebP · ${tamano(r.blob.size)} (antes ${tamano(archivo.size)}). Se sube al guardar.`);
		} catch (err) {
			setProblema(err instanceof Error && err.message ? err.message : 'No se pudo leer la foto. Prueba con otra imagen en formato JPG o PNG.');
		} finally {
			setReduciendo(false);
		}
	}

	const mensaje = problema || error;

	return (
		<div class="flex min-w-0 flex-col gap-2.5">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<span id={`${id}-l`} class="text-[14.5px] font-semibold">
					{etiqueta}
				</span>
				{!src && <span class="inline-flex items-center rounded-pill bg-neutral-bg px-[9px] py-0.5 text-[12.5px] font-semibold text-neutral">Foto pendiente</span>}
			</div>
			<div class={`relative overflow-hidden rounded-md bg-surface ${error ? 'outline-2 outline-danger' : ''}`} style={{ aspectRatio: proporcion }}>
				{src ? (
					<img src={src} alt="Vista previa" class="size-full object-cover" />
				) : (
					<div class="absolute inset-0 flex flex-col justify-center gap-1.5 rounded-md border border-dashed border-line p-5 text-sm text-muted">
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
							<rect x="3" y="3" width="18" height="18" rx="1" />
							<path d="M21 15l-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
							<circle cx="9" cy="9" r="1.6" />
						</svg>
						<span>{textoPendiente ?? 'En el sitio se verá el espacio «Foto pendiente» hasta que subas una.'}</span>
					</div>
				)}
			</div>
			{reduciendo && (
				<p role="status" class="m-0 flex items-center gap-2 text-sm">
					<Girando class="size-3.5 text-amber" />
					Reduciendo a 1600 px y WebP…
				</p>
			)}
			{info && !reduciendo && (
				<p role="status" class="m-0 flex items-center gap-1.5 text-sm font-semibold text-ok">
					<span aria-hidden="true">✓</span>
					{info}
				</p>
			)}
			{mensaje && (
				<span id={`${id}-e`} class="text-sm font-semibold text-danger">
					{mensaje}
				</span>
			)}
			{confirmarQuitar && onQuitar && (
				<div role="alert" class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm border border-danger bg-danger-bg px-3 py-2.5 text-sm">
					<span class="flex-[1_1_200px]">¿Quitar esta foto? La sección quedará con «Foto pendiente».</span>
					<Boton variante="secundario" class="bg-card text-sm" onClick={() => setConfirmarQuitar(false)}>
						No, dejarla
					</Boton>
					<Boton
						variante="peligro"
						class="text-sm"
						onClick={() => {
							setConfirmarQuitar(false);
							setInfo('');
							onQuitar();
						}}
					>
						Sí, quitar
					</Boton>
				</div>
			)}
			<div class="flex flex-wrap gap-2">
				<label class="relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border border-ink px-4 text-[14.5px] font-semibold text-ink focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-amber hover:bg-surface">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
						<path d="M12 15V3M7 8l5-5 5 5M5 21h14" />
					</svg>
					{src ? 'Cambiar foto' : 'Subir foto'}
					<input
						type="file"
						accept="image/*"
						onChange={elegir}
						disabled={reduciendo}
						aria-labelledby={`${id}-l`}
						aria-describedby={mensaje ? `${id}-e` : undefined}
						aria-invalid={Boolean(mensaje) || undefined}
						class="sr-only"
					/>
				</label>
				{src && onQuitar && (
					<Boton variante="texto-peligro" class="text-[14.5px]" onClick={() => setConfirmarQuitar(true)}>
						Quitar foto
					</Boton>
				)}
			</div>
		</div>
	);
}
