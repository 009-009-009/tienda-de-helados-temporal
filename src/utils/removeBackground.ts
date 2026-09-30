/**
 * Advanced background removal & precision micro-detail cleaner:
 * 1. Edge-connected BFS flood-fill from borders.
 * 2. Enclosed pocket cleaner: cleans white gaps between wooden sticks (Lyn, 2 Palos, Chocante),
 *    white plate fragments, spoon remnants, and specular studio white backdrops.
 * 3. Smooth anti-aliased edge feathering.
 * 4. Auto-trim of empty margins to ensure products look large and appetizing.
 */

const processedCache = new Map<string, string>();

export function clearBackgroundCache(): void {
  processedCache.clear();
}

export function removeWhiteBackground(imageSource: string): Promise<string> {
  // Check cache first
  if (processedCache.has(imageSource)) {
    return Promise.resolve(processedCache.get(imageSource)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          resolve(imageSource);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(imageSource);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Check corner pixels to determine background
        const corners = [
          [0, 0],
          [width - 1, 0],
          [0, height - 1],
          [width - 1, height - 1],
          [Math.floor(width / 2), 0],
          [0, Math.floor(height / 2)],
          [width - 1, Math.floor(height / 2)],
        ];

        let alreadyTransparentCorners = 0;
        let lightCorners = 0;

        for (const [cx, cy] of corners) {
          const idx = (cy * width + cx) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a < 50) {
            alreadyTransparentCorners++;
          } else if (r > 220 && g > 220 && b > 220) {
            lightCorners++;
          }
        }

        const visited = new Uint8Array(width * height);

        // Helper to detect flat studio white / backdrop pixel
        const isWhiteBg = (x: number, y: number): boolean => {
          const idx = (y * width + x) * 4;
          const a = data[idx + 3];
          if (a < 30) return true; // already transparent

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const diff = maxVal - minVal;

          return minVal > 218 && diff < 36;
        };

        // PASS 1: Flood fill from all 4 borders inward (outer studio backdrop)
        if (alreadyTransparentCorners < 3 && lightCorners >= 2) {
          const queue: number[] = [];

          // Top and bottom borders
          for (let x = 0; x < width; x++) {
            if (isWhiteBg(x, 0)) {
              const p = 0 * width + x;
              visited[p] = 1;
              queue.push(p);
            }
            if (isWhiteBg(x, height - 1)) {
              const p = (height - 1) * width + x;
              visited[p] = 1;
              queue.push(p);
            }
          }

          // Left and right borders
          for (let y = 0; y < height; y++) {
            if (isWhiteBg(0, y)) {
              const p = y * width + 0;
              if (!visited[p]) {
                visited[p] = 1;
                queue.push(p);
              }
            }
            if (isWhiteBg(width - 1, y)) {
              const p = y * width + (width - 1);
              if (!visited[p]) {
                visited[p] = 1;
                queue.push(p);
              }
            }
          }

          let head = 0;
          while (head < queue.length) {
            const curr = queue[head++];
            const cx = curr % width;
            const cy = Math.floor(curr / width);

            const neighbors = [
              [cx + 1, cy],
              [cx - 1, cy],
              [cx, cy + 1],
              [cx, cy - 1],
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (!visited[nIdx]) {
                  if (isWhiteBg(nx, ny)) {
                    visited[nIdx] = 1;
                    queue.push(nIdx);
                  }
                }
              }
            }
          }

          // Mark outer visited pixels as transparent
          for (let p = 0; p < width * height; p++) {
            if (visited[p]) {
              data[p * 4 + 3] = 0;
            }
          }
        }

        // PASS 2: PRECISION MICRO-DETAIL CLEANER
        // Eliminates trapped white pockets between popsicle sticks (Lyn, 2 Palos, Chocante),
        // and leftover fragments of white ceramic plate or spoon.
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const p = y * width + x;
            const idx = p * 4;
            const a = data[idx + 3];

            if (a > 10) {
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              const minVal = Math.min(r, g, b);
              const maxVal = Math.max(r, g, b);
              const diff = maxVal - minVal;

              // Pure flat studio white or white plate / spoon fragment
              if (minVal > 222 && diff < 30) {
                if (minVal >= 236) {
                  // Completely remove trapped white island
                  data[idx + 3] = 0;
                  visited[p] = 1;
                } else {
                  // Smooth anti-aliased edge
                  const factor = Math.max(0, (236 - minVal) / 14);
                  data[idx + 3] = Math.round(a * factor);
                }
              }
            }
          }
        }

        // PASS 3: Soft edge feathering around newly transparent regions
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const p = y * width + x;
            const idx = p * 4;
            const a = data[idx + 3];

            if (a > 0 && !visited[p]) {
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const minVal = Math.min(r, g, b);

              if (minVal > 212) {
                const hasTransparentNeighbor =
                  (x > 0 && data[(p - 1) * 4 + 3] === 0) ||
                  (x < width - 1 && data[(p + 1) * 4 + 3] === 0) ||
                  (y > 0 && data[(p - width) * 4 + 3] === 0) ||
                  (y < height - 1 && data[(p + width) * 4 + 3] === 0);

                if (hasTransparentNeighbor) {
                  const maxVal = Math.max(r, g, b);
                  const diff = maxVal - minVal;
                  if (diff < 35) {
                    const alphaFactor = Math.max(0, (245 - minVal) / 33);
                    data[idx + 3] = Math.min(a, Math.round(255 * alphaFactor));
                  }
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // PASS 4: AUTO-TRIM bounding box to maximize delicious presence
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        let visibleCount = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (data[idx + 3] > 25) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              visibleCount++;
            }
          }
        }

        if (visibleCount > 100 && maxX > minX && maxY > minY) {
          const padX = Math.round((maxX - minX) * 0.04);
          const padY = Math.round((maxY - minY) * 0.04);
          const cropX = Math.max(0, minX - padX);
          const cropY = Math.max(0, minY - padY);
          const cropW = Math.min(width - cropX, (maxX - minX) + padX * 2);
          const cropH = Math.min(height - cropY, (maxY - minY) + padY * 2);

          if (cropW < width * 0.92 || cropH < height * 0.92) {
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = cropW;
            croppedCanvas.height = cropH;
            const croppedCtx = croppedCanvas.getContext('2d');
            if (croppedCtx) {
              croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
              const resultDataUrl = croppedCanvas.toDataURL('image/png');
              processedCache.set(imageSource, resultDataUrl);
              resolve(resultDataUrl);
              return;
            }
          }
        }

        const resultDataUrl = canvas.toDataURL('image/png');
        processedCache.set(imageSource, resultDataUrl);
        resolve(resultDataUrl);
      } catch (err) {
        console.warn('Could not auto-process image background/trim:', err);
        resolve(imageSource);
      }
    };

    img.onerror = () => {
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}
