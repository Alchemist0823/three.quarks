import type {ParticleColorSpaceMode} from './ParticleNodeMaterials';

/**
 * Target device class of the WebGPU particle renderer.
 *
 * - `'desktop'`: full fidelity, identical output to the WebGL renderer.
 * - `'mobile'`: tuned for tile-based mobile GPUs (Mali / Adreno / Apple). Trades a few
 *   imperceptible or opt-in quality features for fill-rate and bandwidth.
 * - `'auto'`: picks `'mobile'` on touch-first / small-screen devices, `'desktop'` otherwise.
 */
export type QuarksRenderTarget = 'desktop' | 'mobile' | 'auto';

/**
 * Resolved set of switches used by the WebGPU batches.
 */
export interface QuarksPerformanceProfile {
    /** resolved target (`'auto'` is resolved to one of the two) */
    readonly target: 'desktop' | 'mobile';
    /**
     * Soft particles read the scene depth. Without a user depth texture this copies the framebuffer
     * depth once per render, which forces tile-based GPUs to resolve depth to memory and split the
     * render pass. Mobile defaults to hard particles; set `true` to opt back in.
     */
    softParticles: boolean;
    /**
     * Sprite-sheet frame blending (two texture fetches per fragment). Kept on for both targets by
     * default, can be disabled on mobile to halve texture bandwidth of flip-book effects.
     */
    frameBlending: boolean;
    /** use a pow-free polynomial for the sRGB decode in `webgl-compatible` color mode (≤0.3% error) */
    fastColorDecode: boolean;
    /** how particle colors are written to the framebuffer, see {@link ParticleColorSpaceMode} */
    colorSpaceMode: ParticleColorSpaceMode;
    /** initial instance capacity of a sprite batch (grows by doubling) */
    initialSpriteCapacity: number;
    /** initial vertex capacity budget of a trail batch (grows by doubling) */
    initialTrailCapacity: number;
}

export type QuarksPerformanceProfileOptions = Partial<Omit<QuarksPerformanceProfile, 'target'>> & {
    target?: QuarksRenderTarget;
};

/**
 * Heuristic mobile detection used by `target: 'auto'`.
 */
export function isLikelyMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as Navigator & {userAgentData?: {mobile?: boolean}};
    if (nav.userAgentData && typeof nav.userAgentData.mobile === 'boolean') {
        return nav.userAgentData.mobile;
    }
    const ua = nav.userAgent || '';
    if (/Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|Opera Mini/i.test(ua)) return true;
    // iPadOS reports itself as a Mac – detect it through touch support
    return /Macintosh/.test(ua) && typeof nav.maxTouchPoints === 'number' && nav.maxTouchPoints > 1;
}

/**
 * Builds the performance profile for a target, applying explicit overrides.
 */
export function createPerformanceProfile(options: QuarksPerformanceProfileOptions = {}): QuarksPerformanceProfile {
    const requested = options.target ?? 'desktop';
    const target: 'desktop' | 'mobile' =
        requested === 'auto' ? (isLikelyMobileDevice() ? 'mobile' : 'desktop') : requested;

    const defaults: QuarksPerformanceProfile =
        target === 'mobile'
            ? {
                  target,
                  softParticles: false,
                  frameBlending: true,
                  fastColorDecode: true,
                  colorSpaceMode: 'webgl-compatible',
                  initialSpriteCapacity: 256,
                  initialTrailCapacity: 4096,
              }
            : {
                  target,
                  softParticles: true,
                  frameBlending: true,
                  fastColorDecode: false,
                  colorSpaceMode: 'webgl-compatible',
                  initialSpriteCapacity: 1000,
                  initialTrailCapacity: 10000,
              };

    const {target: _ignored, ...overrides} = options;
    const profile = {...defaults};
    for (const key of Object.keys(overrides) as Array<keyof typeof overrides>) {
        if (overrides[key] !== undefined) (profile as any)[key] = overrides[key];
    }
    return profile;
}

/**
 * Recommended `WebGPURenderer` construction parameters and pixel ratio for a profile.
 *
 * Particles are fill-rate bound (large, overlapping, blended quads), so the drawing-buffer
 * resolution is the single most effective lever on high-DPI phones: rendering a 3x DPR screen at
 * 1.5x shades 4x fewer fragments.
 */
export function getRecommendedRendererSettings(
    profile: QuarksPerformanceProfile,
    devicePixelRatio: number = typeof window !== 'undefined' ? window.devicePixelRatio : 1
) {
    if (profile.target === 'mobile') {
        return {
            pixelRatio: Math.min(devicePixelRatio, 1.5),
            parameters: {antialias: false, powerPreference: 'low-power' as 'low-power' | 'high-performance'},
        };
    }
    return {
        pixelRatio: Math.min(devicePixelRatio, 2),
        parameters: {antialias: true, powerPreference: 'high-performance' as 'low-power' | 'high-performance'},
    };
}
