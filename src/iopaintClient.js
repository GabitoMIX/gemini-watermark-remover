export const DEFAULT_IOPAINT_ENDPOINT = 'http://127.0.0.1:8080';

const DEFAULT_TIMEOUT_MS = 120000;

export function normalizeIopaintEndpoint(endpoint = DEFAULT_IOPAINT_ENDPOINT) {
    const normalized = String(endpoint || '').trim() || DEFAULT_IOPAINT_ENDPOINT;
    return normalized.replace(/\/+$/, '');
}

export function buildIopaintInpaintUrl(endpoint = DEFAULT_IOPAINT_ENDPOINT) {
    return `${normalizeIopaintEndpoint(endpoint)}/api/v1/inpaint`;
}

function toFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

export function resolveMaskRect(imageWidth, imageHeight, position, {
    paddingRatio = 0.38,
    minPadding = 14
} = {}) {
    const width = toFiniteNumber(imageWidth);
    const height = toFiniteNumber(imageHeight);
    const x = toFiniteNumber(position?.x);
    const y = toFiniteNumber(position?.y);
    const rectWidth = toFiniteNumber(position?.width ?? position?.size);
    const rectHeight = toFiniteNumber(position?.height ?? position?.size);

    if (!width || !height || x === null || y === null || !rectWidth || !rectHeight) {
        return null;
    }

    const padding = Math.max(minPadding, Math.ceil(Math.max(rectWidth, rectHeight) * paddingRatio));
    const left = Math.max(0, Math.floor(x - padding));
    const top = Math.max(0, Math.floor(y - padding));
    const right = Math.min(width, Math.ceil(x + rectWidth + padding));
    const bottom = Math.min(height, Math.ceil(y + rectHeight + padding));

    if (right <= left || bottom <= top) return null;

    return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top
    };
}

function canvasToPngBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
                return;
            }
            reject(new Error('No se pudo crear la mascara para IOPaint'));
        }, 'image/png');
    });
}

export async function createMaskBlob({ width, height, position }) {
    const maskRect = resolveMaskRect(width, height, position);
    if (!maskRect) {
        throw new Error('No se pudo calcular la mascara para IOPaint');
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas no disponible para crear la mascara de IOPaint');
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(maskRect.x, maskRect.y, maskRect.width, maskRect.height);

    return canvasToPngBlob(canvas);
}

export function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('No se pudo convertir la imagen a base64'));
        reader.readAsDataURL(blob);
    });
}

function dataUrlToBlob(dataUrl) {
    const [header, payload] = String(dataUrl || '').split(',');
    if (!payload) {
        throw new Error('Respuesta base64 invalida de IOPaint');
    }

    const mimeMatch = /^data:([^;]+);base64$/i.exec(header || '');
    const mimeType = mimeMatch?.[1] || 'image/png';
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mimeType });
}

async function parseIopaintResponse(response) {
    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`IOPaint respondio ${response.status}: ${errorText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
        return response.blob();
    }

    if (!contentType.includes('application/json')) {
        const blob = await response.blob().catch(() => null);
        if (blob?.size) return blob;
        throw new Error('IOPaint devolvio una respuesta vacia');
    }

    const payload = await response.json().catch(() => null);
    const image = payload?.image || payload?.result || payload?.data?.image;
    if (typeof image === 'string' && image.startsWith('data:image/')) {
        return dataUrlToBlob(image);
    }

    throw new Error('IOPaint no devolvio una imagen valida');
}

export async function requestIopaintInpaint({
    endpoint = DEFAULT_IOPAINT_ENDPOINT,
    imageBlob,
    maskBlob,
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS
}) {
    if (!imageBlob || !maskBlob) {
        throw new Error('IOPaint necesita imagen y mascara');
    }
    if (typeof fetchImpl !== 'function') {
        throw new Error('fetch no esta disponible para llamar a IOPaint');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const [image, mask] = await Promise.all([
            blobToDataUrl(imageBlob),
            blobToDataUrl(maskBlob)
        ]);
        const response = await fetchImpl(buildIopaintInpaintUrl(endpoint), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image,
                mask,
                prompt: '',
                negative_prompt: '',
                sd_steps: 20,
                sd_seed: -1
            }),
            signal: controller.signal
        });

        return parseIopaintResponse(response);
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function refineBlobWithIopaint({
    endpoint,
    imageBlob,
    width,
    height,
    watermarkInfo,
    fetchImpl
}) {
    const maskBlob = await createMaskBlob({
        width,
        height,
        position: watermarkInfo?.position
    });

    const processedBlob = await requestIopaintInpaint({
        endpoint,
        imageBlob,
        maskBlob,
        fetchImpl
    });

    return {
        processedBlob,
        processedMeta: {
            source: 'iopaint',
            processorPath: 'iopaint',
            mask: resolveMaskRect(width, height, watermarkInfo?.position)
        }
    };
}
