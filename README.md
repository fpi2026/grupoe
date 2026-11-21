# Cabañas Alpinas El Limo — sitio web

Sitio web bilingüe (español e inglés) de **Cabañas Alpinas El Limo**, en el Cantón El Limo, Metapán, dentro de la zona de amortiguamiento de la Reserva de la Biosfera Trifinio Fraternidad.

Propuesta académica – UES-FMOcc (FPI 2026, grupo E).

Publicación prevista: <https://fpi2026.github.io/grupoe/>

## Tecnologías

- [Astro](https://astro.build/) con salida estática y TypeScript estricto
- [Tailwind CSS v4](https://tailwindcss.com/) con los tokens del diseño en `src/styles/global.css`
- Tipografías Newsreader y Hanken Grotesk autoalojadas con [Fontsource](https://fontsource.org/)
- GitHub Pages con la [acción oficial de Astro](https://docs.astro.build/en/guides/deploy/github/)

## Requisitos

- Node.js 22.23.4 o superior
- npm

## Comandos

Se ejecutan desde la raíz del repositorio:

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las dependencias |
| `npm run dev` | Servidor local en `http://localhost:4321/grupoe/` |
| `npm run check` | Revisa los tipos de TypeScript y de los componentes |
| `npm run build` | Compila el sitio en `dist/` |
| `npm run preview` | Sirve la compilación de `dist/` para revisarla |

## Estructura

```text
.github/workflows/deploy.yml   Despliegue en GitHub Pages
public/                        Archivos que se copian tal cual (favicon)
src/
  components/                  Header, Footer, WhatsAppButton, Logo, Fog
  i18n/
    ui.ts                      Diccionario ES/EN, rutas traducidas y contacto
    utils.ts                   withBase, localizedPath, useTranslations, whatsappUrl
  layouts/BaseLayout.astro     <head>, tema día/noche, encabezado y pie
  pages/                       Páginas en español (/)
    en/                        Páginas en inglés (/en/)
  styles/global.css            Tokens del diseño, tema día/noche y utilidades
```

## Reglas para contribuir

- **Idiomas:** cada página existe en `src/pages/` (español) y en `src/pages/en/` (inglés). Los textos de la interfaz van en `src/i18n/ui.ts`; las rutas traducidas, en `routes`.
- **Enlaces internos:** nunca escribir rutas a mano. Usar `localizedPath('alojamiento', lang)` para páginas y `withBase('archivo.ext')` para archivos. Así funcionan bajo `/grupoe/`.
- **Tema día/noche:** se controla con `data-theme` en `<html>` y se guarda en `localStorage` (`cael-theme`). Los colores se usan con las clases del tema (`bg-bg`, `text-ink`, `bg-btn`, `text-amber-ink`…), nunca con colores fijos.
- **Contenido:** solo datos del informe institucional del hostal. No se inventan cifras, precios ni reseñas.

## Despliegue

El flujo `.github/workflows/deploy.yml` tiene dos pasos:

- **Compilar:** en cada `push` a `main` revisa los tipos y compila el sitio. Sirve como comprobación automática.
- **Publicar:** por ahora solo corre al ejecutar el flujo a mano desde la pestaña **Actions** (*Run workflow*), porque GitHub Pages todavía no está activado en el repositorio.

Para activar la publicación (requiere permisos de administración del repositorio):

1. **Settings → Pages → Build and deployment → Source:** elegir **GitHub Actions**.
2. Ejecutar el flujo a mano desde **Actions**.
3. Para publicar en cada `push`, borrar la línea `if:` del paso `deploy` en `deploy.yml`.

### Cambiar la dirección de publicación

`site` y `base` están en `astro.config.mjs` y se pueden sobrescribir con variables de entorno al compilar, por ejemplo para un dominio propio:

```sh
SITE_URL=https://ejemplo.com BASE_PATH=/ npm run build
```
