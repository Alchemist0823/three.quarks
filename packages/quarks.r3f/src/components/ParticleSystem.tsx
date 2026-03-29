import React, { forwardRef, useImperativeHandle } from 'react';
import { useParticleSystem } from '../hooks/useParticleSystem';
import type { ParticleSystemProps, ParticleSystemRef } from '../types';

/**
 * Declarative particle system component for React Three Fiber.
 *
 * Renders a three.quarks ParticleSystem with full configuration via props.
 * Must be used within a QuarksProvider.
 *
 * @example
 * ```tsx
 * import { QuarksProvider, ParticleSystem } from 'quarks.r3f'
 * import { ConeEmitter, SizeOverLife, Bezier } from 'three.quarks'
 *
 * <QuarksProvider>
 *   <ParticleSystem
 *     duration={5}
 *     looping
 *     startLife={[1, 2]}
 *     startSpeed={5}
 *     startSize={0.1}
 *     emissionOverTime={100}
 *     shape={new ConeEmitter({ angle: 0.4, radius: 0.5 })}
 *     renderMode={RenderMode.BillBoard}
 *     behaviors={[
 *       new SizeOverLife(new Bezier([[0, 1], [1, 0]]))
 *     ]}
 *     position={[0, 1, 0]}
 *     autoPlay
 *   />
 * </QuarksProvider>
 * ```
 */
export const ParticleSystem = forwardRef<ParticleSystemRef, ParticleSystemProps>(
    function ParticleSystem(props, ref) {
        const { position, rotation, scale, ...systemProps } = props;

        const { system, emitter, play, pause, restart, stop } = useParticleSystem(systemProps);

        // Expose ref API
        useImperativeHandle(ref, () => ({
            system,
            emitter,
            play,
            pause,
            restart,
            stop,
        }), [system, emitter, play, pause, restart, stop]);

        // Render the emitter as a primitive with transform props
        // R3F will apply position/rotation/scale to the Object3D
        return (
            <primitive
                object={emitter}
                position={position}
                rotation={rotation}
                scale={scale}
            />
        );
    }
);
