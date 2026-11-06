export interface WatermarkOptions {
  readonly pageWidth: number;
  readonly pageHeight: number;
  readonly x: number;
  readonly y: number;
  readonly fontSize: number;
  readonly rotation?: number;
  readonly color?: readonly [number, number, number];
}

export interface WatermarkOverlay {
  readonly content: string;
  readonly bounds: Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  readonly resourceName: 'LPWM';
}

export class PdfWatermarkError extends Error {
  constructor(
    readonly code: 'invalid' | 'limit',
    message: string,
  ) {
    super(message);
    this.name = 'PdfWatermarkError';
  }
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new PdfWatermarkError('invalid', `${name} must be finite.`);
}

function escapePdfText(text: string): string {
  if (text.length > 2000)
    throw new PdfWatermarkError('limit', 'Watermark text is limited to 2,000 characters.');
  if (!/^[\x20-\x7e]*$/.test(text))
    throw new PdfWatermarkError('invalid', 'Only printable ASCII watermark text is supported.');
  return text.replace(/[\\()]/g, '\\$&');
}

export function createPdfWatermarkOverlay(
  text: string,
  options: WatermarkOptions,
): WatermarkOverlay {
  const escaped = escapePdfText(text);
  for (const [name, value] of Object.entries(options)) {
    if (typeof value === 'number') assertFinite(value, name);
  }
  const { pageWidth, pageHeight, x, y, fontSize } = options;
  if (pageWidth <= 0 || pageHeight <= 0 || fontSize <= 0 || fontSize > 500) {
    throw new PdfWatermarkError(
      'invalid',
      'Page dimensions and font size must be positive; font size is capped at 500.',
    );
  }
  if (x < 0 || y < 0 || x > pageWidth || y > pageHeight)
    throw new PdfWatermarkError('invalid', 'Watermark origin must lie on the page.');
  const angle = options.rotation ?? 0;
  const radians = (angle * Math.PI) / 180;
  const a = Math.cos(radians).toFixed(6);
  const b = Math.sin(radians).toFixed(6);
  const c = (-Math.sin(radians)).toFixed(6);
  const d = Math.cos(radians).toFixed(6);
  const [red, green, blue] = options.color ?? [0.5, 0.5, 0.5];
  if (
    [red, green, blue].some(
      (component) => !Number.isFinite(component) || component < 0 || component > 1,
    )
  ) {
    throw new PdfWatermarkError('invalid', 'Color components must be in the range 0–1.');
  }
  const width = Math.min(pageWidth - x, Math.max(fontSize, escaped.length * fontSize * 0.6));
  const height = Math.min(pageHeight - y, fontSize * 1.2);
  const content = `q\n${red} ${green} ${blue} rg\n${a} ${b} ${c} ${d} ${x} ${y} cm\nBT\n/LPWM ${fontSize} Tf\n0 0 Td\n(${escaped}) Tj\nET\nQ\n`;
  return {
    content,
    bounds: Object.freeze({ x, y, width, height }),
    resourceName: 'LPWM',
  };
}

export function createRepeatedWatermarkOverlays(
  text: string,
  pageWidth: number,
  pageHeight: number,
  spacing: number,
  fontSize: number,
  rotation = -35,
): readonly WatermarkOverlay[] {
  if (
    ![pageWidth, pageHeight, spacing, fontSize].every(Number.isFinite) ||
    pageWidth <= 0 ||
    pageHeight <= 0 ||
    spacing <= 0
  ) {
    throw new PdfWatermarkError('invalid', 'Page size and spacing must be positive finite values.');
  }
  const count = Math.ceil(pageWidth / spacing) * Math.ceil(pageHeight / spacing);
  if (count > 10_000)
    throw new PdfWatermarkError('limit', 'Repeated layout exceeds 10,000 overlays.');
  const overlays: WatermarkOverlay[] = [];
  for (let y = spacing / 2; y < pageHeight; y += spacing) {
    for (let x = spacing / 2; x < pageWidth; x += spacing) {
      overlays.push(
        createPdfWatermarkOverlay(text, {
          pageWidth,
          pageHeight,
          x,
          y,
          fontSize,
          rotation,
        }),
      );
    }
  }
  return overlays;
}

export function encodeWatermarkContent(overlay: WatermarkOverlay): Uint8Array {
  return new TextEncoder().encode(overlay.content);
}
