/**
 * Semilla del modo demostración del panel (src/admin/lib/demo.ts): lista de las noticias,
 * los JSON de src/content/datos/ e imágenes del repositorio tal como estaban al compilar. Los .md y .json van con su texto; las
 * imágenes se descargan aparte desde raw.githubusercontent.com (el repositorio es público).
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

const CARPETAS = ['src/content/noticias/es', 'src/content/noticias/en', 'src/content/datos', 'src/assets/img', 'src/assets/noticias', 'src/assets/subidas'];

/** sha de un archivo calculado como lo hace git ("blob <tamaño>\0<contenido>"). */
const shaGit = (buf: Buffer) => crypto.createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');

export function GET() {
	const archivos: { path: string; sha: string; texto?: string }[] = [];
	for (const dir of CARPETAS) {
		const abs = path.join(process.cwd(), dir);
		if (!fs.existsSync(abs)) continue;
		for (const nombre of fs.readdirSync(abs).sort()) {
			const buf = fs.readFileSync(path.join(abs, nombre));
			archivos.push({ path: `${dir}/${nombre}`, sha: shaGit(buf), ...(/\.(md|json)$/.test(nombre) && { texto: buf.toString('utf8') }) });
		}
	}
	return new Response(
		JSON.stringify({
			// En GitHub Actions, el commit exacto que se compiló; en local, la rama
			commit: process.env.GITHUB_SHA ?? 'main',
			fecha: new Date().toISOString(),
			archivos,
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}
