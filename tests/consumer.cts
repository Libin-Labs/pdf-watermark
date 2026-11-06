import { createRepeatedWatermarkOverlays } from '@lp-labs/pdf-watermark';

const overlays = createRepeatedWatermarkOverlays('COPY', 100, 100, 50, 8);
const count: number = overlays.length;
void count;
