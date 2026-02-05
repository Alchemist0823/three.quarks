import React, { forwardRef, useImperativeHandle, useEffect, ForwardRefExoticComponent, RefAttributes } from 'react';
import { useQuarksEffect } from '../hooks/useQuarksEffect';
import type { QuarksEffectProps, QuarksEffectRef } from '../types';

/**
 * QuarksEffect component type with preload static method
 */
interface QuarksEffectComponent
    extends ForwardRefExoticComponent<QuarksEffectProps & RefAttributes<QuarksEffectRef>> {
    /** Preload an effect URL */
    preload: (url: string) => void;
}

/**
 * Component for loading and displaying JSON particle effects.
 *
 * Supports React Suspense for loading states.
 * Must be used within a QuarksProvider.
 *
 * @example
 * ```tsx
 * import { Suspense } from 'react'
 * import { QuarksProvider, QuarksEffect } from 'quarks.r3f'
 *
 * function App() {
 *   return (
 *     <Canvas>
 *       <QuarksProvider>
 *         <Suspense fallback={null}>
 *           <QuarksEffect
 *             url="/effects/explosion.json"
 *             position={[0, 0, 0]}
 *             autoPlay
 *           />
 *         </Suspense>
 *       </QuarksProvider>
 *     </Canvas>
 *   )
 * }
 * ```
 */
const QuarksEffectBase = forwardRef<QuarksEffectRef, QuarksEffectProps>(
    function QuarksEffect(props, ref) {
        const { url, position, rotation, scale, autoPlay = true } = props;

        const { group, systems, play, pause, restart } = useQuarksEffect(url);

        // Expose ref API
        useImperativeHandle(ref, () => ({
            group,
            systems,
            play,
            pause,
            restart,
        }), [group, systems, play, pause, restart]);

        // Apply transform props to group
        useEffect(() => {
            if (position) {
                group.position.set(position[0], position[1], position[2]);
            }
        }, [group, position]);

        useEffect(() => {
            if (rotation) {
                group.rotation.set(rotation[0], rotation[1], rotation[2]);
            }
        }, [group, rotation]);

        useEffect(() => {
            if (scale) {
                group.scale.set(scale[0], scale[1], scale[2]);
            }
        }, [group, scale]);

        // Handle autoPlay
        useEffect(() => {
            if (autoPlay) {
                play();
            } else {
                pause();
            }
        }, [autoPlay, play, pause]);

        // Render the group as a primitive
        return <primitive object={group} />;
    }
);

/**
 * Preload an effect URL (useful for avoiding loading spinners)
 */
(QuarksEffectBase as QuarksEffectComponent).preload = useQuarksEffect.preload;

export const QuarksEffect = QuarksEffectBase as QuarksEffectComponent;
