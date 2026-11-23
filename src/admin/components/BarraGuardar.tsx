/**
 * Barra de guardar fija abajo (diseno/BarraGuardar.dc.html): estado «todo guardado / cambios sin
 * guardar / guardando», confirmaciones de borrado y de descarte en la misma página y aviso del
 * navegador si se cierra la pestaña con cambios.
 */
import { useEffect, useState } from 'preact/hooks';
import { Boton, Girando } from './ui';

interface Props {
	sucio: boolean;
	/** Todavía no existe (por ejemplo, una noticia nueva): no se dice «Todo guardado». */
	nuevo?: boolean;
	guardando: boolean;
	/** Texto del botón principal («Guardar y publicar», «Guardar borrador»…). */
	primario: string;
	/** Texto del botón de borrar; sin él no se muestra. */
	borrar?: string;
	borrarPregunta?: string;
	borrarTexto?: string;
	/** Nota junto al estado (por ejemplo, «Falta el texto en inglés»). */
	nota?: string;
	onPrimario: () => void;
	onCancelar: () => void;
	onBorrar?: () => void;
}

export function BarraGuardar(p: Props) {
	const [confirmarBorrado, setConfirmarBorrado] = useState(false);
	const [confirmarDescarte, setConfirmarDescarte] = useState(false);

	useEffect(() => {
		if (!p.sucio || p.guardando) return;
		const antes = (e: BeforeUnloadEvent) => {
			e.preventDefault(); // el navegador muestra su propio aviso al cerrar la pestaña
		};
		window.addEventListener('beforeunload', antes);
		return () => window.removeEventListener('beforeunload', antes);
	}, [p.sucio, p.guardando]);

	const g = p.guardando;
	const color = g ? 'border-warn' : p.sucio ? 'bg-amber' : p.nuevo ? 'bg-line' : 'bg-ok';
	const fila = 'mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-4 gap-y-2.5 px-[clamp(16px,3vw,40px)] py-3';

	return (
		<div class="sticky bottom-(--panel-nav-h) z-30 mt-auto border-t border-line bg-bg shadow-[0_-6px_18px_rgba(0,0,0,.06)]">
			{confirmarBorrado && (
				<div role="alert" class="bg-danger-bg">
					<div class={fila}>
						<div class="flex flex-[1_1_280px] flex-col gap-0.5">
							<strong class="text-danger">{p.borrarPregunta ?? '¿Borrar definitivamente?'}</strong>
							<span class="text-sm">{p.borrarTexto ?? 'Se quitará del sitio en la próxima publicación.'}</span>
						</div>
						<div class="flex flex-wrap gap-2">
							<Boton variante="secundario" class="bg-card" onClick={() => setConfirmarBorrado(false)} disabled={g} autoFocus>
								No, conservar
							</Boton>
							<Boton
								variante="peligro"
								disabled={g}
								onClick={() => {
									setConfirmarBorrado(false);
									p.onBorrar?.();
								}}
							>
								Sí, borrar
							</Boton>
						</div>
					</div>
				</div>
			)}
			{confirmarDescarte && (
				<div role="alert" class="bg-warn-bg">
					<div class={fila}>
						<span class="flex-[1_1_280px]">
							<strong>¿Descartar los cambios?</strong> Lo que escribiste desde la última vez que guardaste se perderá.
						</span>
						<div class="flex flex-wrap gap-2">
							<Boton variante="secundario" class="bg-card" onClick={() => setConfirmarDescarte(false)} autoFocus>
								Seguir editando
							</Boton>
							<Boton
								variante="contorno"
								onClick={() => {
									setConfirmarDescarte(false);
									p.onCancelar();
								}}
							>
								Descartar cambios
							</Boton>
						</div>
					</div>
				</div>
			)}
			<div class={`${fila} py-2.5`}>
				<p role="status" class="m-0 mr-auto flex min-w-0 flex-[1_1_200px] items-center gap-2 text-[14.5px]">
					{g ? <Girando class={`size-3.5 ${color} text-warn`} /> : <span aria-hidden="true" class={`size-2.5 flex-none rounded-full ${color}`} />}
					<span class="font-semibold">{g ? 'Guardando…' : p.sucio ? 'Cambios sin guardar' : p.nuevo ? 'Sin guardar todavía' : 'Todo guardado'}</span>
					{p.nota && <span class="text-muted">· {p.nota}</span>}
				</p>
				<div class="flex flex-[0_1_auto] flex-wrap gap-2">
					{p.borrar && (
						<Boton
							variante="texto-peligro"
							disabled={g}
							onClick={() => {
								setConfirmarDescarte(false);
								setConfirmarBorrado(true);
							}}
						>
							{p.borrar}
						</Boton>
					)}
					<Boton
						variante="secundario"
						disabled={g}
						onClick={() => {
							if (!p.sucio) return p.onCancelar();
							setConfirmarBorrado(false);
							setConfirmarDescarte(true);
						}}
					>
						Cancelar
					</Boton>
					<Boton onClick={p.onPrimario} disabled={g} aria-busy={g} class="px-5">
						{g ? 'Guardando…' : p.primario}
						<span aria-hidden="true">→</span>
					</Boton>
				</div>
			</div>
		</div>
	);
}
