# Integracion local con IOPaint

La herramienta local puede usar IOPaint como refinador opcional de IA.

## Flujo

1. La pagina procesa primero la imagen con el motor rapido del repositorio.
2. Si el modo `IA local + fallback` esta activo, genera una mascara en la zona estimada de la marca de agua.
3. Envia `image + mask` a `POST /api/v1/inpaint` del servidor IOPaint.
4. Si IOPaint responde con una imagen, esa salida reemplaza al resultado rapido.
5. Si IOPaint falla o no esta levantado, se conserva el resultado rapido.

## Arranque local simple

IOPaint recomienda iniciar el servidor con LaMa en CPU asi:

```bash
pip3 install iopaint
iopaint start --model=lama --device=cpu --port=8080
```

Despues abre la herramienta del repo y selecciona:

- `Modo`: `IA local + fallback`
- `IOPaint API`: `http://127.0.0.1:8080`

## Dokploy / Docker

La integracion solo necesita que el contenedor exponga el puerto de IOPaint y que el navegador pueda llegar a esa URL.
Si lo publicas detras de un dominio o proxy, coloca esa URL en el campo `IOPaint API`.

Ejemplos:

```text
http://127.0.0.1:8080
http://orange-pi.local:8080
https://iopaint.tu-dominio.com
```

En CPU puede tardar bastante con imagenes grandes. Para pruebas rapidas, usa imagenes medianas primero.
