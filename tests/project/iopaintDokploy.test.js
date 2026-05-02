import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readText(relativePath) {
  return readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

test('iopaint dokploy compose should define a standalone cpu service', async () => {
  const compose = await readText('deploy/iopaint/compose.yaml');

  assert.match(compose, /services:\s*\n\s+iopaint:/);
  assert.match(compose, /image:\s+\$\{IOPAINT_IMAGE:-ghcr\.io\/sanster\/iopaint:cpu\}/);
  assert.match(compose, /entrypoint:\s+\[\]/);
  assert.match(compose, /--model=\$\{IOPAINT_MODEL:-lama\}/);
  assert.match(compose, /--device=\$\{IOPAINT_DEVICE:-cpu\}/);
  assert.match(compose, /--host=0\.0\.0\.0/);
  assert.match(compose, /--port=8080/);
  assert.match(compose, /iopaint-data:/);
  assert.match(compose, /healthcheck:/);
});

test('iopaint dokploy docs should distinguish manual editor from automatic gemini flow', async () => {
  const readme = await readText('deploy/iopaint/README.md');

  assert.match(readme, /borrador magico manual/i);
  assert.match(readme, /Gemini Watermark Remover: automatico/i);
  assert.match(readme, /IOPaint: manual/i);
  assert.match(readme, /deploy\/iopaint\/compose\.yaml/);
});
