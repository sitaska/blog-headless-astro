# Guía operativa — Blog Astro + WordPress

Esta guía resume el flujo que hemos dejado configurado para mantener el blog en producción.

## 1) Cómo funciona ahora

- Frontend: Astro estático (se genera en build).
- CMS: WordPress headless (fuente de contenido).
- Deploy: Vercel (automático al hacer push a main o al llamar al Deploy Hook).

Importante: al ser estático, cualquier cambio en slugs, categorías o contenido requiere nuevo build/deploy para verse en el blog público.

## 2) Publicar cambios a producción (manual)

1. Ejecutar comprobación:

```bash
npm run check
```

2. Subir cambios:

```bash
git add .
git commit -m "Tu mensaje"
git push origin main
```

3. Vercel desplegará automáticamente.

## 3) Auto-deploy desde WordPress (Deploy Hook)

### En Vercel

- Ir a Project Settings > Git > Deploy Hooks.
- Crear un hook (ejemplo: wordpress-update).
- Copiar la URL del hook.

### En WordPress

Añadir este snippet (plugin Code Snippets o functions.php) y reemplazar la URL del hook:

```php
<?php
define('VERCEL_DEPLOY_HOOK_URL', 'PEGA_AQUI_TU_URL_DE_DEPLOY_HOOK');

function sita_trigger_vercel_deploy_on_post_save($post_id, $post, $update) {
	if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
		return;
	}

	if (!isset($post->post_type) || $post->post_type !== 'post') {
		return;
	}

	if (!isset($post->post_status) || $post->post_status !== 'publish') {
		return;
	}

	$lock_key = 'vercel_deploy_lock_' . $post_id;
	if (get_transient($lock_key)) {
		return;
	}
	set_transient($lock_key, 1, 60);

	wp_remote_post(VERCEL_DEPLOY_HOOK_URL, [
		'timeout' => 15,
		'blocking' => false,
		'headers' => ['Content-Type' => 'application/json'],
		'body' => wp_json_encode([
			'post_id' => $post_id,
			'slug' => $post->post_name ?? '',
			'updated_at' => current_time('mysql', true),
		]),
	]);
}
add_action('save_post_post', 'sita_trigger_vercel_deploy_on_post_save', 20, 3);
```

## 4) Categorías nuevas: cuándo aparecen en Astro

- Si creas una categoría y además guardas/actualizas una entrada publicada, se dispara deploy y aparecerá tras finalizar.
- Si solo creas la categoría y no se guarda ningún post, normalmente no habrá deploy (con el hook actual).

## 5) Enlaces de posts y slugs

Se ajustó el frontend para que use la ruta real de WordPress (path derivado del link) en listados, evitando desalineación cuando cambian slugs.

Archivos tocados en el proyecto:

- src/pages/index.astro
- src/pages/categorias/[slug].astro

## 6) Efecto visual añadido en tarjetas

- Zoom suave al pasar el ratón por la imagen de la tarjeta.
- La imagen no se sale del marco (overflow hidden en el contenedor).
- Aplicado en portada y listado por categoría.

## 7) Verificación rápida tras cambios

Checklist recomendado:

1. Ejecutar:

```bash
npm run check
```

2. Probar en local:

```bash
npm run dev
```

3. Revisar en navegador:

- Home
- Una categoría
- Un post
- Enlace de imagen de tarjetas

4. Validar en producción tras deploy:

- URL principal del blog
- Enlaces de posts recientes
- Categorías nuevas o editadas

## 8) Problemas comunes y solución

### Cambié slug en WordPress y sigue saliendo el antiguo

Causa: no se ha regenerado el sitio estático.

Solución:

- Disparar deploy (push a main o hook).
- Esperar a que Vercel termine build.
- Refrescar caché del navegador si hace falta.

### Sitemap se ve “feo” en navegador

Es normal: XML sin hoja de estilo.
No afecta al SEO ni al rastreo de Google.

---

Documento creado para uso operativo continuo del proyecto blog-headless-astro.
