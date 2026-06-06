import rawSvg from './themeable_sudoku_logo_detailed_cropped.svg?raw';

// Replace the original flat-color <style> block with CSS-variable-driven colors.
// The 9 layers go from shadow (layer0) → primary (layer4) → accent highlight (layer8).
// color-mix() is supported in Chrome 111+, Firefox 113+, Safari 16.4+.
// The .bg rect becomes transparent so the logo works on any theme background.
const THEMED_SVG: string = (() => {
    const noXmlDecl = rawSvg.replace(/<\?xml[^?]*\?>\s*/g, '');
    const themedStyle = `<style>
.bg { fill: transparent; }
.layer0 { fill: color-mix(in srgb, var(--color-primary) 12%, #000); fill-rule: evenodd; }
.layer1 { fill: color-mix(in srgb, var(--color-primary) 28%, #000); fill-rule: evenodd; }
.layer2 { fill: color-mix(in srgb, var(--color-primary) 50%, #000); fill-rule: evenodd; }
.layer3 { fill: color-mix(in srgb, var(--color-primary) 75%, #000); fill-rule: evenodd; }
.layer4 { fill: var(--color-primary); fill-rule: evenodd; }
.layer5 { fill: color-mix(in srgb, var(--color-accent) 70%, var(--color-primary)); fill-rule: evenodd; }
.layer6 { fill: color-mix(in srgb, var(--color-accent) 50%, #fff); fill-rule: evenodd; }
.layer7 { fill: color-mix(in srgb, var(--color-accent) 25%, #fff); fill-rule: evenodd; }
.layer8 { fill: color-mix(in srgb, var(--color-accent) 8%, #fff); fill-rule: evenodd; }
</style>`;
    return noXmlDecl.replace(/<style>[\s\S]*?<\/style>/, themedStyle);
})();

export interface LogoProps {
    /** Width in px. Height is computed from the native 1448×1086 aspect ratio. */
    size?: number;
    className?: string;
}

export function Logo({ size = 240, className }: LogoProps) {
    const height = Math.round((size * 496) / 1309);
    const svg = THEMED_SVG
        .replace('width="1309"', `width="${size}"`)
        .replace('height="496"', `height="${height}"`);
    return (
        <div
            role="img"
            aria-label="Sudoku"
            className={className}
            style={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0 }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
