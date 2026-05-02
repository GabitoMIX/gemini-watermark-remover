import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readText(relativePath) {
  return readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

test('iopaint dokploy compose should define a standalone cpu service', async () => {
  const compose = await readText('deploy/iopaint/compose.yaml');

  assert.match(compose, /services:\s*\n\s+iopaint:/);
  assert.match(compose, /build:/);
  assert.match(compose, /dockerfile:\s+deploy\/iopaint\/Dockerfile/);
  assert.match(compose, /IOPAINT_VERSION:\s+\$\{IOPAINT_VERSION:-1\.5\.3\}/);
  assert.match(compose, /IOPAINT_INSTALL_TOYS:\s+\$\{IOPAINT_INSTALL_TOYS:-1\}/);
  assert.match(compose, /\/usr\/local\/bin\/start-iopaint/);
  assert.match(compose, /IOPAINT_ENABLE_REMOVE_BG:\s+\$\{IOPAINT_ENABLE_REMOVE_BG:-1\}/);
  assert.match(compose, /IOPAINT_ENABLE_REALESRGAN:\s+\$\{IOPAINT_ENABLE_REALESRGAN:-1\}/);
  assert.match(compose, /IOPAINT_ENABLE_GFPGAN:\s+\$\{IOPAINT_ENABLE_GFPGAN:-1\}/);
  assert.match(compose, /\$\{IOPAINT_PORT:-8086\}:8080/);
  assert.doesNotMatch(compose, /container_name:/);
  assert.match(compose, /iopaint-data:/);
  assert.match(compose, /healthcheck:/);
});

test('iopaint dockerfile should install cpu dependencies from pip', async () => {
  const dockerfile = await readText('deploy/iopaint/Dockerfile');

  assert.match(dockerfile, /FROM python:3\.10-slim-bookworm/);
  assert.match(dockerfile, /ARG IOPAINT_VERSION=1\.5\.3/);
  assert.match(dockerfile, /ARG IOPAINT_INSTALL_TOYS=1/);
  assert.match(dockerfile, /pip install torch torchvision --index-url https:\/\/download\.pytorch\.org\/whl\/cpu/);
  assert.match(dockerfile, /pip install "IOPaint==\$\{IOPAINT_VERSION\}"/);
  assert.match(dockerfile, /iopaint install-plugins-packages/);
  assert.match(dockerfile, /pip install gfpgan realesrgan segment-anything/);
  assert.match(dockerfile, /COPY deploy\/iopaint\/start\.sh/);
  assert.match(dockerfile, /EXPOSE 8080/);
});

test('iopaint start script should enable optional toys by default', async () => {
  const startScript = await readText('deploy/iopaint/start.sh');

  assert.match(startScript, /--enable-interactive-seg/);
  assert.match(startScript, /--enable-remove-bg/);
  assert.match(startScript, /--enable-anime-seg/);
  assert.match(startScript, /--enable-realesrgan/);
  assert.match(startScript, /--enable-gfpgan/);
  assert.match(startScript, /--enable-restoreformer/);
  assert.match(startScript, /IOPAINT_INTERACTIVE_SEG_MODEL:-mobile_sam/);
  assert.match(startScript, /IOPAINT_REMOVE_BG_MODEL:-briaai\/RMBG-1\.4/);
});

test('iopaint dokploy docs should distinguish manual editor from automatic gemini flow', async () => {
  const readme = await readText('deploy/iopaint/README.md');

  assert.match(readme, /borrador magico manual/i);
  assert.match(readme, /Gemini Watermark Remover: automatico/i);
  assert.match(readme, /IOPaint: manual/i);
  assert.match(readme, /deploy\/iopaint\/compose\.yaml/);
  assert.match(readme, /pip install IOPaint/i);
  assert.match(readme, /RemoveBG/);
  assert.match(readme, /RealESRGAN/);
  assert.match(readme, /GFPGAN/);
});
