# Deploy de Gemini Watermark Remover en Dokploy

Si Dokploy sigue mostrando textos viejos, cambia la app del removedor a Dockerfile para forzar un build limpio.

## Opcion recomendada

En la app actual de Dokploy:

- Provider: `Git`
- Repository URL: `https://github.com/GabitoMIX/gemini-watermark-remover.git`
- Branch: `main`
- Build Path: `/`
- Build Type: `Dockerfile`
- Dockerfile Path: `Dockerfile`
- Puerto interno: `80`

Luego:

1. `Save`
2. Activa `Clean Cache`
3. `Rebuild`
4. `Start`

## Verificacion

Abre:

```text
http://TU_IP:PUERTO/build-info.json
```

Debe mostrar algo parecido a:

```json
{
  "name": "@pilio/gemini-watermark-remover",
  "locale": "es"
}
```

Si `build-info.json` no existe o la pagina sigue en chino, ese puerto esta apuntando a otro contenedor o Dokploy no reconstruyo esta app.

## Relacion con IOPaint

Esta app es el removedor automatico para Gemini. IOPaint va en otra app separada con:

```text
deploy/iopaint/compose.yaml
```
