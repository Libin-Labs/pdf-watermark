# @lp-labs/pdf-watermark

Creates escaped PDF text content operators and page-space overlay layouts for an adapter to place
into a document. It generates an overlay stream, not a modified PDF.

## Install and quick start

```sh
npm install @lp-labs/pdf-watermark
```

```js
import { createPdfWatermarkOverlay, encodeWatermarkContent } from '@lp-labs/pdf-watermark';

const overlay = createPdfWatermarkOverlay('DRAFT (review)', {
  pageWidth: 612,
  pageHeight: 792,
  x: 72,
  y: 120,
  fontSize: 24,
  rotation: -30,
});
console.log(overlay.content, encodeWatermarkContent(overlay).byteLength);
```

## API, types, and customization

- `WatermarkOptions` requires page size, origin, and positive font size; optional rotation is in
  degrees and RGB color components range from 0 to 1. `createPdfWatermarkOverlay` returns the
  operator `content`, estimated `bounds`, and `/LPWM` font `resourceName`.
- `createRepeatedWatermarkOverlays(text, width, height, spacing, fontSize, rotation?)` returns
  regularly centered overlay placements, capped at 10,000. `encodeWatermarkContent` encodes operators
  as UTF-8 bytes.
- Text is limited to 2,000 printable ASCII characters; PDF literal-string delimiters and backslashes
  are escaped. `PdfWatermarkError` reports `invalid` or `limit`.

## Interoperability and scope

The PDF adapter must register the named font resource, insert the content into the intended page,
manage graphics resources, and save bytes. Output uses a basic text operator stream only: no font
embedding, transparency, Unicode font encoding, or arbitrary-PDF editing is attempted.

ESM, CommonJS, and TypeScript declarations are included. There are no runtime or peer dependencies;
TypeScript and Prettier are development-only.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
