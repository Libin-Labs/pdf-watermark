import {
  createPdfWatermarkOverlay,
  encodeWatermarkContent,
  type WatermarkOptions,
  type WatermarkOverlay,
} from '@lp-labs/pdf-watermark';

const options: WatermarkOptions = {
  pageWidth: 100,
  pageHeight: 100,
  x: 5,
  y: 5,
  fontSize: 8,
};
const overlay: WatermarkOverlay = createPdfWatermarkOverlay('DRAFT', options);
const bytes: Uint8Array = encodeWatermarkContent(overlay);
void bytes;
