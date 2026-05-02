import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readText(relativePath) {
  return readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

test('Dockerfile should build dist and serve it with nginx', async () => {
  const dockerfile = await readText('Dockerfile');

  assert.match(dockerfile, /FROM node:24-alpine AS build/);
  assert.match(dockerfile, /pnpm build/);
  assert.match(dockerfile, /FROM nginx:1\.27-alpine/);
  assert.match(dockerfile, /COPY --from=build \/app\/dist \/usr\/share\/nginx\/html/);
  assert.match(dockerfile, /EXPOSE 80/);
});

test('nginx config should expose build info and disable stale cache', async () => {
  const nginxConfig = await readText('deploy/gemini/nginx.conf');

  assert.match(nginxConfig, /X-GWR-Build-Locale "es"/);
  assert.match(nginxConfig, /Cache-Control "no-store"/);
  assert.match(nginxConfig, /location = \/build-info\.json/);
});

test('build script should emit a spanish build-info marker', async () => {
  const buildScript = await readText('build.js');

  assert.match(buildScript, /function writeBuildInfo\(\)/);
  assert.match(buildScript, /locale:\s+'es'/);
  assert.match(buildScript, /dist\/build-info\.json/);
});
