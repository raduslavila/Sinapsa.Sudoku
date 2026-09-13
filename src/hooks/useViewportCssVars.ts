import { useEffect } from 'react';

function getViewportSize() {
  const visualViewport = window.visualViewport;

  return {
    width: visualViewport?.width ?? window.innerWidth,
    height: visualViewport?.height ?? window.innerHeight,
  };
}

export function useViewportCssVars(): void {
  useEffect(() => {
    let frameId: number | null = null;

    const updateViewportVars = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        const { width, height } = getViewportSize();
        const root = document.documentElement;

        root.style.setProperty('--app-width', `${width}px`);
        root.style.setProperty('--app-height', `${height}px`);
        root.style.setProperty('--safe-top', 'env(safe-area-inset-top, 0px)');
        root.style.setProperty('--safe-right', 'env(safe-area-inset-right, 0px)');
        root.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom, 0px)');
        root.style.setProperty('--safe-left', 'env(safe-area-inset-left, 0px)');
      });
    };

    updateViewportVars();

    window.addEventListener('resize', updateViewportVars);
    window.addEventListener('orientationchange', updateViewportVars);
    window.visualViewport?.addEventListener('resize', updateViewportVars);
    window.visualViewport?.addEventListener('scroll', updateViewportVars);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('resize', updateViewportVars);
      window.removeEventListener('orientationchange', updateViewportVars);
      window.visualViewport?.removeEventListener('resize', updateViewportVars);
      window.visualViewport?.removeEventListener('scroll', updateViewportVars);
    };
  }, []);
}
