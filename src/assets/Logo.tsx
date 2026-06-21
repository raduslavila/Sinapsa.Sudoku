import rawSvg from './themeable_sudoku_logo_detailed_cropped.svg?raw';

// Replace the original flat-color <style> block with CSS-variable-driven colors.
// The 9 layers go from shadow (layer0) → primary (layer4) → accent highlight (layer8).
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
    /**
     * CSS height of the logo.
     *
     * Examples:
     * - "10dvh"
     * - "64px"
     * - "4rem"
     *
     * Defaults to 10dvh.
     */
    height?: string;

    className?: string;
}

export function Logo({ height = '10dvh', className }: LogoProps) {
    const svg = THEMED_SVG
        .replace(/\swidth="[^"]*"/, ' width="100%"')
        .replace(/\sheight="[^"]*"/, ' height="100%"')
        .replace(
            /<svg\b/,
            '<svg style="display:block;width:auto;height:100%;max-width:100%;" preserveAspectRatio="xMidYMid meet"'
        );

    return (
        <div
            role="img"
            aria-label="Sudoku"
            className={className}
            style={{
                display: 'inline-flex',
                height,
                maxHeight: height,
                width: 'auto',
                lineHeight: 0,
                flexShrink: 0,
                overflow: 'visible',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
