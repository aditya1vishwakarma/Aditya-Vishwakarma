/**
 * Rebuilds the gallery thumbnails from the full-size originals on R2.
 *
 *   node devtools/make-previews.mjs            every photo in PHOTOS (constants.ts)
 *   node devtools/make-previews.mjs daisies    just the ones named
 *
 * Output lands in devtools/previews-out/, named to match previewimges/ on R2, ready to
 * upload over the old files.
 *
 * Why this exists: the old previews came out of Apple's exporter, which writes some AVIFs
 * as a grid of tiles and others with an essential `clap` crop box. Safari and Chrome cope;
 * Firefox refuses both and draws an empty tile. sharp writes a single plain image, which
 * every browser decodes. Each preview is checked for those boxes before it's written.
 */
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'devtools', 'previews-out');
const BASE = 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/';

// Grid cells are square and object-cover, so the *short* side is what fills a cell. 800
// covers a ~240px desktop cell at 3x, with room for the hover zoom.
const SHORT_SIDE = 800;
const QUALITY = 70;   // sharp's AVIF scale; 50 is its default, ~70 is visually transparent here

// The photo list (PHOTOS) lives in constants.ts; reading it from there means a new photo needs no edit here.
const hero = await readFile(join(ROOT, 'constants.ts'), 'utf8');
const all = [...hero.matchAll(/fullimages\/([\w-]+)\.avif/g)].map(m => m[1]);
const wanted = process.argv.slice(2);
const names = wanted.length ? all.filter(n => wanted.includes(n)) : all;
const unknown = wanted.filter(n => !all.includes(n));
if (unknown.length) throw new Error(`not in constants.ts: ${unknown.join(', ')}`);

// Boxes Firefox won't decode. Only the header is searched — image data could contain
// these four bytes by chance.
const hasUnsupportedBoxes = (buf) => {
  const meta = buf.subarray(0, buf.indexOf('mdat') + 4);
  return ['grid', 'clap'].filter(box => meta.includes(box));
};

await mkdir(OUT, { recursive: true });
let before = 0, after = 0;

for (const name of names) {
  const res = await fetch(`${BASE}${name}.avif`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const src = Buffer.from(await res.arrayBuffer());

  const out = await sharp(src)
    .autoOrient()                                 // bake in irot so nothing depends on it
    .resize(SHORT_SIDE, SHORT_SIDE, { fit: 'outside', withoutEnlargement: true })
    .keepIccProfile()                             // Display P3 / Adobe RGB originals; don't flatten to sRGB
    .avif({ quality: QUALITY, effort: 6, chromaSubsampling: '4:4:4' })
    .toBuffer({ resolveWithObject: true });

  const bad = hasUnsupportedBoxes(out.data);
  if (bad.length) throw new Error(`${name}: output still has ${bad.join(', ')}`);

  await writeFile(join(OUT, `${name}.avif`), out.data);
  before += src.length;
  after += out.data.length;
  console.log(`${name.padEnd(22)} ${out.info.width}x${out.info.height}  ${(out.data.length / 1024).toFixed(0).padStart(5)} KB`);
}

console.log(`\n${names.length} previews, ${(after / 1e6).toFixed(1)} MB (from ${(before / 1e6).toFixed(1)} MB of originals) -> ${OUT}`);
