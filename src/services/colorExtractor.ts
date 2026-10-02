/**
 * @license
 * Mehsic Dynamic Artwork Color Extractor
 * Safely extracts muted ambient background tones from album artwork with high-contrast text guarantee.
 */

export interface ArtworkColors {
  primaryDark: string; // Deep ambient tint (e.g. rgb(18, 24, 40))
  accentGlow: string; // Subtle accent highlight (e.g. rgba(45, 80, 150, 0.25))
  cardSurface: string; // Translucent card background
  textColor: string; // High contrast text (#ffffff)
}

const DEFAULT_COLORS: ArtworkColors = {
  primaryDark: '#090b12',
  accentGlow: 'rgba(37, 99, 235, 0.22)',
  cardSurface: 'rgba(15, 23, 42, 0.65)',
  textColor: '#ffffff',
};

const colorCache = new Map<string, ArtworkColors>();

export async function extractArtworkColors(imageUrl: string): Promise<ArtworkColors> {
  if (!imageUrl) return DEFAULT_COLORS;
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      // Set timeout in case image request hangs
      const timer = setTimeout(() => {
        resolve(DEFAULT_COLORS);
      }, 1500);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve(DEFAULT_COLORS);
            return;
          }

          canvas.width = 40;
          canvas.height = 40;
          ctx.drawImage(img, 0, 0, 40, 40);

          const imgData = ctx.getImageData(0, 0, 40, 40).data;
          let r = 0, g = 0, b = 0, count = 0;

          for (let i = 0; i < imgData.length; i += 16) {
            const pr = imgData[i];
            const pg = imgData[i + 1];
            const pb = imgData[i + 2];
            // Filter out extreme highlights or near-blacks
            const lum = 0.299 * pr + 0.587 * pg + 0.114 * pb;
            if (lum > 20 && lum < 230) {
              r += pr;
              g += pg;
              b += pb;
              count++;
            }
          }

          if (count === 0) {
            resolve(DEFAULT_COLORS);
            return;
          }

          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);

          // Darken significantly for dark theme & readability: clamp luminance to 10-18%
          const scale = 0.22;
          const darkR = Math.max(8, Math.min(30, Math.round(r * scale)));
          const darkG = Math.max(10, Math.min(32, Math.round(g * scale)));
          const darkB = Math.max(16, Math.min(42, Math.round(b * scale)));

          const colors: ArtworkColors = {
            primaryDark: `rgb(${darkR}, ${darkG}, ${darkB})`,
            accentGlow: `rgba(${Math.min(255, Math.round(r * 0.85))}, ${Math.min(
              255,
              Math.round(g * 0.85)
            )}, ${Math.min(255, Math.round(b * 0.85))}, 0.22)`,
            cardSurface: `rgba(${darkR + 6}, ${darkG + 8}, ${darkB + 12}, 0.7)`,
            textColor: '#ffffff',
          };

          colorCache.set(imageUrl, colors);
          resolve(colors);
        } catch {
          resolve(DEFAULT_COLORS);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        resolve(DEFAULT_COLORS);
      };

      img.src = imageUrl;
    } catch {
      resolve(DEFAULT_COLORS);
    }
  });
}
