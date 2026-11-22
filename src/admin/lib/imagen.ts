/**
 * Reduce una foto en el navegador antes de subirla (Plan del sitio):
 * lado mayor de 1600 px como máximo y WebP, para que pese menos de ~400 KB.
 */
const MAX = 1600;
const LIMITE = 400 * 1024;

export async function comprimirImagen(archivo: File): Promise<Blob> {
	if (!archivo.type.startsWith('image/')) throw new Error('El archivo no es una imagen.');
	const bmp = await createImageBitmap(archivo);
	const escala = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(bmp.width * escala);
	canvas.height = Math.round(bmp.height * escala);
	canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
	bmp.close();

	const aWebp = (q: number) =>
		new Promise<Blob>((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo convertir la imagen.'))), 'image/webp', q));

	// Baja la calidad hasta quedar bajo el límite
	let calidad = 0.82;
	let blob = await aWebp(calidad);
	while (blob.size > LIMITE && calidad > 0.5) {
		calidad -= 0.08;
		blob = await aWebp(calidad);
	}
	if (blob.type !== 'image/webp') throw new Error('Tu navegador no puede convertir a WebP. Prueba con Chrome, Edge o Firefox.');
	return blob;
}

export const tamano = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);
