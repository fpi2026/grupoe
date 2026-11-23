# Cabañas Alpinas El Limo — sitio web

Sitio web bilingüe (español e inglés) de **Cabañas Alpinas El Limo**, en el Cantón El Limo, Metapán, dentro de la zona de amortiguamiento de la Reserva de la Biosfera Trifinio Fraternidad.

Propuesta académica – UES-FMOcc (FPI 2026, grupo E).

Sitio publicado: <https://fpi2026.github.io/grupoe/>

## Tecnologías

- [Astro](https://astro.build/) con salida estática y TypeScript estricto
- [Tailwind CSS v4](https://tailwindcss.com/) con los tokens del diseño en `src/styles/global.css`
- Tipografías Newsreader y Hanken Grotesk autoalojadas con [Fontsource](https://fontsource.org/)
- GitHub Pages con la [acción oficial de Astro](https://docs.astro.build/en/guides/deploy/github/)
- Panel de contenido `/admin` con [Preact](https://preactjs.com/) y [axios](https://axios-http.com/) contra la API de GitHub

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
  admin/                       Panel de contenido (CMS): App.tsx, components/, lib/github.ts
  content/noticias/{es,en}/    Noticias en Markdown (las edita el panel)
  content.config.ts            Esquema de la colección de noticias
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

## Panel de contenido (`/admin`)

El panel lee y escribe las noticias del repositorio con la API de GitHub. Cada guardado es **un commit** en `main` (noticia ES, EN y portada juntas) y el flujo de Actions vuelve a compilar el sitio. No hay servidor ni base de datos.

1. Crear un token *fine-grained* en GitHub (*Settings → Developer settings → Personal access tokens → Fine-grained tokens*):
   - *Resource owner*: la organización `fpi2026`; *Repository access*: solo `grupoe`.
   - Permisos: **Contents** lectura y escritura; **Actions** solo lectura (estado de la publicación).
   - Con fecha de vencimiento. Si la organización lo exige, un administrador debe aprobarlo.
2. Abrir `/admin/` (en local: `http://localhost:4321/grupoe/admin/`) y pegar el token. Se guarda en `sessionStorage` y se borra al cerrar la pestaña; nunca va en el código.
3. **Noticias:** crear, editar y borrar, con textos en español e inglés, vista previa en Markdown y foto de portada (se reduce a 1600 px y WebP en el navegador). Una noticia sin marcar como *Publicada* es un borrador: se guarda, pero no aparece en el sitio.
4. Si alguien cambió la misma noticia mientras se editaba, el panel avisa y no sobrescribe.

Variables opcionales (archivo `.env`): `PUBLIC_GH_OWNER`, `PUBLIC_GH_REPO`, `PUBLIC_GH_BRANCH` y `PUBLIC_GH_API` (por defecto `fpi2026`, `grupoe`, `main` y la API pública de GitHub).

## Despliegue

El flujo `.github/workflows/deploy.yml` corre en cada `push` a `main` (también los guardados del panel) y se puede ejecutar a mano desde **Actions** (*Run workflow*). Tiene dos pasos:

- **Compilar:** revisa los tipos y compila el sitio. Si falla, no se publica nada y queda en línea la versión anterior.
- **Publicar:** sube la compilación a GitHub Pages (*Settings → Pages → Source: GitHub Actions*).

### Cambiar la dirección de publicación

`site` y `base` están en `astro.config.mjs` y se pueden sobrescribir con variables de entorno al compilar, por ejemplo para un dominio propio:

```sh
SITE_URL=https://ejemplo.com BASE_PATH=/ npm run build
```
