// @ts-nocheck
import type { ImageMetadata } from 'astro';

// Auto-import all images from src/assets/img/moka/
const imageModules = import.meta.glob('/src/assets/img/moka/*.{png,jpg,jpeg,PNG,JPG,JPEG}', {
  eager: true,
  import: 'default',
}) as Record<string, ImageMetadata>;

// Build a lookup map: normalize filenames to lowercase keys
// e.g. "/src/assets/img/moka/hamburguesa.png" → "hamburguesa"
const imageMap: Record<string, ImageMetadata> = {};
for (const path in imageModules) {
  const fileName = path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
  imageMap[fileName] = imageModules[path];
}

/**
 * Resolves an image path (like "/img/moka/HAMBURGUESA MOKA CHEP.PNG")
 * to an ImageMetadata object for use with Astro's <Image /> component.
 */
export function resolveImage(imagePath: string): ImageMetadata | undefined {
  if (!imagePath) return undefined;
  const fileName = imagePath.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
  return imageMap[fileName];
}
