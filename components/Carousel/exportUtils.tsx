import * as htmlToImage from 'html-to-image';
import JSZip from 'jszip';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CarouselSlide } from './types';
import { CarouselSlideRenderer } from './CarouselSlideRenderer';

export const exportSingleSlide = async (
  element: HTMLElement,
  filename = 'slide-cause-commune.png'
): Promise<void> => {
  await document.fonts.ready;

  const dataUrl = await htmlToImage.toPng(element, {
    width: 1080,
    height: 1080,
    pixelRatio: 1,
    cacheBust: true,
    style: {
      transform: 'none',
      transformOrigin: 'top left'
    }
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

/**
 * Rend l'ensemble des diapositives d'un carrousel en DataURLs PNG 1080x1080.
 * Utile pour l'export ZIP et pour la publication sur Instagram.
 */
export const renderCarouselSlidesToDataUrls = async (
  slides: CarouselSlide[],
  mediaName: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> => {
  await document.fonts.ready;

  const total = slides.length;
  const results: string[] = [];

  // Create temporary offscreen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '1080px';
  container.style.height = '1080px';
  container.style.overflow = 'hidden';
  container.style.zIndex = '-1000';
  document.body.appendChild(container);

  try {
    for (let i = 0; i < total; i++) {
      if (onProgress) onProgress(i + 1, total);

      const slide = slides[i];
      const root = createRoot(container);

      // Render the slide into offscreen container
      await new Promise<void>((resolve) => {
        root.render(
          <CarouselSlideRenderer
            slide={slide}
            mediaName={mediaName}
            pageIndex={i}
            totalPages={total}
            scale={1}
          />
        );
        // Small delay to allow React DOM and font paint to settle
        setTimeout(resolve, 80);
      });

      const slideEl = container.firstElementChild as HTMLElement;
      if (!slideEl) {
        root.unmount();
        continue;
      }

      const dataUrl = await htmlToImage.toPng(slideEl, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        cacheBust: true,
      });

      results.push(dataUrl);
      root.unmount();
    }
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }

  return results;
};

export const exportCarouselZip = async (
  slides: CarouselSlide[],
  mediaName: string,
  projectTitle: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  const dataUrls = await renderCarouselSlidesToDataUrls(slides, mediaName, onProgress);
  const zip = new JSZip();

  dataUrls.forEach((dataUrl, i) => {
    const base64Data = dataUrl.split(',')[1];
    const slideNum = String(i + 1).padStart(2, '0');
    zip.file(`slide-${slideNum}.png`, base64Data, { base64: true });
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const slug = projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'carrousel';

  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `carrousel-${slug}.zip`;
  link.click();
  URL.revokeObjectURL(link.href);
};
