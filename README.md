# Blog Headless con Astro + WordPress

Proyecto base para migrar `blog.lascositasdesita.com` desde WordPress clásico a frontend estático con Astro, manteniendo SEO y URLs.

## Stack

- Astro (estático)
- WordPress REST API como CMS
- RSS + Sitemap
- Rutas por slug para conservar URLs del blog

## Variables de entorno

Copia `.env.example` a `.env` y ajusta valores si hace falta:

```bash
PUBLIC_SITE_URL=https://blog.lascositasdesita.com
PUBLIC_WP_API_BASE=https://cms.lascositasdesita.com/wp-json/wp/v2
```

## Comandos

- `npm install`
- `npm run dev`
- `npm run check`
- `npm run build`
- `npm run preview`

## Rutas implementadas

- `/` inicio con listado de posts
- `/categorias/` listado de categorías
- `/categorias/:slug/` listado por categoría
- `/:slug` y rutas anidadas vía `src/pages/[...slug].astro`
- `/rss.xml`
- `/robots.txt`

## Migración (checklist)

1. Confirmar que los slugs en WordPress son los finales.
2. Verificar que cada URL antigua existe en el build nuevo.
3. Añadir redirecciones puntuales en `src/redirects.mjs` para URLs legacy.
4. Validar canonical, meta robots y sitemap antes del corte.
5. Hacer crawl previo/post (ej. Screaming Frog) y comparar 200/301/404.

## SEO y paridad de URLs

- La ruta dinámica usa el `link` original de WordPress para reconstruir pathname.
- `sitemap` se genera automáticamente con Astro.
- `robots.txt` apunta al sitemap del dominio final.

## Despliegue en Vercel / Netlify

1. Conecta el repositorio en Vercel o Netlify.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Define variables `PUBLIC_SITE_URL` y `PUBLIC_WP_API_BASE` en el panel del hosting.
5. Publica y prueba en URL temporal.
6. Mantén WordPress en `cms.lascositasdesita.com` como backend de contenidos.

## Corte de dominio (`blog.lascositasdesita.com`)

1. Baja TTL DNS a 300 unos minutos antes.
2. Apunta DNS al nuevo proveedor (CNAME o A/ALIAS según Vercel/Netlify).
3. Revalida:
	- Home
	- 10-20 posts críticos
	- RSS
	- Sitemap
4. Mantén monitorización de 404 y Search Console 72h.
