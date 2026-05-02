import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildIopaintInpaintUrl,
  normalizeIopaintEndpoint,
  resolveMaskRect
} from '../../src/iopaintClient.js';

test('normalizeIopaintEndpoint should trim trailing slashes and keep the default URL', () => {
  assert.equal(normalizeIopaintEndpoint('http://127.0.0.1:8080///'), 'http://127.0.0.1:8080');
  assert.equal(normalizeIopaintEndpoint(''), 'http://127.0.0.1:8080');
});

test('buildIopaintInpaintUrl should target the inpaint endpoint', () => {
  assert.equal(
    buildIopaintInpaintUrl('http://orange-pi.local:8080/'),
    'http://orange-pi.local:8080/api/v1/inpaint'
  );
});

test('resolveMaskRect should expand and clamp the watermark area', () => {
  const rect = resolveMaskRect(320, 180, {
    x: 280,
    y: 140,
    width: 32,
    height: 32
  });

  assert.deepEqual(rect, {
    x: 266,
    y: 126,
    width: 54,
    height: 54
  });
});

test('resolveMaskRect should return null for incomplete dimensions', () => {
  assert.equal(resolveMaskRect(320, 180, null), null);
  assert.equal(resolveMaskRect(0, 180, { x: 1, y: 1, width: 10, height: 10 }), null);
});
