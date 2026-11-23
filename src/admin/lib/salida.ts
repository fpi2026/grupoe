/**
 * Aviso de cambios sin guardar al cambiar de pantalla dentro del panel (sin ventanas del navegador).
 * El editor registra una función; si devuelve true, App deshace el cambio de ruta y el editor
 * muestra su aviso «Tienes cambios sin guardar» con la opción de salir igual.
 */
type Guardia = (destino: string) => boolean;

let guardia: Guardia | null = null;

export const protegerSalida = (g: Guardia | null) => {
	guardia = g;
};

/** true = la salida se detuvo (hay cambios sin guardar). */
export const salidaBloqueada = (destino: string) => Boolean(guardia?.(destino));
