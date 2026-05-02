# IOPaint para Dokploy

Este stack levanta IOPaint como borrador magico manual, separado de la herramienta automatica de marcas de agua de Gemini.

## Para que sirve

- Gemini Watermark Remover: automatico, rapido, pensado para la marca de agua de Gemini.
- IOPaint: manual, tipo mini editor de fotos; pintas con brocha lo que quieres borrar y LaMa reconstruye el fondo.

## Dokploy

1. Crea una nueva app en Dokploy.
2. Elige despliegue por Docker Compose desde este repositorio.
3. Usa esta ruta como compose:

```text
deploy/iopaint/compose.yaml
```

4. Configura las variables de entorno:

```env
IOPAINT_VERSION=1.5.3
IOPAINT_INSTALL_TOYS=1
IOPAINT_PORT=8086
IOPAINT_MODEL=lama
IOPAINT_DEVICE=cpu
IOPAINT_MEMORY_LIMIT=4g
IOPAINT_ENABLE_INTERACTIVE_SEG=1
IOPAINT_INTERACTIVE_SEG_MODEL=mobile_sam
IOPAINT_INTERACTIVE_SEG_DEVICE=cpu
IOPAINT_ENABLE_REMOVE_BG=1
IOPAINT_REMOVE_BG_MODEL=briaai/RMBG-1.4
IOPAINT_REMOVE_BG_DEVICE=cpu
IOPAINT_ENABLE_ANIME_SEG=1
IOPAINT_ENABLE_REALESRGAN=1
IOPAINT_REALESRGAN_DEVICE=cpu
IOPAINT_REALESRGAN_MODEL=realesr-general-x4v3
IOPAINT_ENABLE_GFPGAN=1
IOPAINT_GFPGAN_DEVICE=cpu
IOPAINT_ENABLE_RESTOREFORMER=1
IOPAINT_RESTOREFORMER_DEVICE=cpu
```

5. Publica el puerto externo `8086` o asigna un dominio/proxy en Dokploy al puerto interno `8080`.

## Uso directo

Cuando Dokploy termine, abre la URL de IOPaint. Vas a ver una interfaz tipo editor:

1. Sube la imagen.
2. Ajusta el grosor del pincel.
3. Pinta sobre el objeto, texto, persona o imperfeccion.
4. Espera el procesamiento en CPU.
5. Descarga el resultado.

## Conexion con esta herramienta

Si tambien quieres usarlo como refinador automatico desde la pantalla local del repo:

1. Abre Gemini Watermark Remover.
2. Selecciona `IA local + fallback`.
3. En `IOPaint API`, coloca la URL publicada por Dokploy.

Ejemplos:

```text
http://192.168.13.204:8086
https://iopaint.tu-dominio.com
```

## Notas para Orange Pi

- En CPU, LaMa puede tardar varios segundos por imagen.
- La imagen se construye desde `pip install IOPaint` para evitar depender de imagenes GHCR privadas o sin tag publico.
- `IOPAINT_INSTALL_TOYS=1` instala dependencias de plugins y deja activos RemoveBG, segmentacion interactiva, AnimeSeg, RealESRGAN, GFPGAN y RestoreFormer.
- Si el contenedor se queda sin memoria, apaga primero `IOPAINT_ENABLE_REALESRGAN=0`, `IOPAINT_ENABLE_GFPGAN=0` y `IOPAINT_ENABLE_RESTOREFORMER=0`.
- La primera ejecucion descarga el modelo y puede tardar mas.
- El volumen `iopaint-data` conserva cache/modelos entre reinicios.
- En Orange Pi / ARM64, la instalacion descarga ruedas CPU de PyTorch; el primer build puede tardar bastante y consumir varios GB.
