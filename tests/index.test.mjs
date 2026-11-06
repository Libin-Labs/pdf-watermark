import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPdfWatermarkOverlay,
  createRepeatedWatermarkOverlays,
  encodeWatermarkContent,
} from '../dist/esm/index.js';

test('emits escaped PDF text operators and a font resource requirement', () => {
  const overlay = createPdfWatermarkOverlay('DRAFT (review)', {
    pageWidth: 612,
    pageHeight: 792,
    x: 30,
    y: 40,
    fontSize: 18,
  });
  assert.match(overlay.content, /\/LPWM 18 Tf/);
  assert.ok(overlay.content.includes('(DRAFT \\(review\\)) Tj'));
  assert.deepEqual(
    [...encodeWatermarkContent(overlay)],
    [...new TextEncoder().encode(overlay.content)],
  );
});

test('generates bounded repeated overlays at predictable page positions', () => {
  const overlays = createRepeatedWatermarkOverlays('COPY', 100, 100, 50, 10);
  assert.equal(overlays.length, 4);
  assert.deepEqual(
    overlays.map((item) => [item.bounds.x, item.bounds.y]),
    [
      [25, 25],
      [75, 25],
      [25, 75],
      [75, 75],
    ],
  );
});

test('rejects non-ASCII text outside the declared simple encoding subset', () => {
  assert.throws(
    () =>
      createPdfWatermarkOverlay('café', {
        pageWidth: 100,
        pageHeight: 100,
        x: 1,
        y: 1,
        fontSize: 10,
      }),
    { code: 'invalid' },
  );
});

test('validates page geometry, font size, and color components', () => {
  assert.throws(
    () =>
      createPdfWatermarkOverlay('OK', {
        pageWidth: 10,
        pageHeight: 10,
        x: 11,
        y: 1,
        fontSize: 5,
      }),
    { code: 'invalid' },
  );
  assert.throws(
    () =>
      createPdfWatermarkOverlay('OK', {
        pageWidth: 10,
        pageHeight: 10,
        x: 1,
        y: 1,
        fontSize: 5,
        color: [2, 0, 0],
      }),
    { code: 'invalid' },
  );
});
