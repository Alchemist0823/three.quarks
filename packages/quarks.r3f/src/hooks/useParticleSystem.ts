import { useRef, useEffect, useMemo, useCallback } from 'react';
import {
    ParticleSystem,
    ParticleSystemParameters,
    RenderMode,
    ConstantValue,
    ConstantColor,
    SphereEmitter,
    Vector4,
} from 'three.quarks';
import { MeshBasicMaterial, AdditiveBlending, DoubleSide } from 'three';
import { useQuarks } from '../QuarksContext';
import { toValueGenerator, toColorGenerator, isDefined } from '../utils';
import type { ParticleSystemProps, UseParticleSystemReturn } from '../types';

/**
 * Convert component props to ParticleSystemParameters
 */
function propsToParameters(props: ParticleSystemProps): ParticleSystemParameters {
    const {
        // Core simulation
        autoDestroy,
        looping,
        prewarm,
        duration,

        // Emission
        shape,
        emissionOverTime,
        emissionOverDistance,
        emissionBursts,

        // Particle initial properties
        startLife,
        startSpeed,
        startRotation,
        startSize,
        startColor,
        startTileIndex,
        startLength,

        // Behaviors
        behaviors,

        // Rendering
        instancingGeometry,
        renderMode,
        rendererEmitterSettings,
        speedFactor,
        material,
        layers,

        // Tiling
        uTileCount,
        vTileCount,
        blendTiles,

        // Soft particles
        softParticles,
        softNearFade,
        softFarFade,

        // Ordering
        renderOrder,

        // Transform
        worldSpace,
        onlyUsedByOther,
    } = props;

    // Create default material if not provided
    const finalMaterial = material ?? new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        blending: AdditiveBlending,
        side: DoubleSide,
        depthWrite: false,
    });

    const params: ParticleSystemParameters = {
        material: finalMaterial,
    };

    // Core simulation
    if (isDefined(autoDestroy)) params.autoDestroy = autoDestroy;
    if (isDefined(looping)) params.looping = looping;
    if (isDefined(prewarm)) params.prewarm = prewarm;
    if (isDefined(duration)) params.duration = duration;

    // Emission
    if (isDefined(shape)) params.shape = shape;
    if (isDefined(emissionOverTime)) params.emissionOverTime = toValueGenerator(emissionOverTime);
    if (isDefined(emissionOverDistance)) params.emissionOverDistance = toValueGenerator(emissionOverDistance);
    if (isDefined(emissionBursts)) params.emissionBursts = emissionBursts;

    // Particle initial properties
    if (isDefined(startLife)) params.startLife = toValueGenerator(startLife);
    if (isDefined(startSpeed)) params.startSpeed = toValueGenerator(startSpeed);
    if (isDefined(startRotation)) {
        // Handle both FlexibleValue and RotationGenerator
        if (typeof startRotation === 'number' || Array.isArray(startRotation)) {
            params.startRotation = toValueGenerator(startRotation);
        } else {
            params.startRotation = startRotation as any;
        }
    }
    if (isDefined(startSize)) {
        // Handle both FlexibleValue and Vector3Generator
        if (typeof startSize === 'number' || Array.isArray(startSize)) {
            params.startSize = toValueGenerator(startSize);
        } else {
            params.startSize = startSize as any;
        }
    }
    if (isDefined(startColor)) params.startColor = toColorGenerator(startColor);
    if (isDefined(startTileIndex)) params.startTileIndex = startTileIndex;
    // startLength is handled via rendererEmitterSettings for Trail mode

    // Behaviors
    if (isDefined(behaviors)) params.behaviors = behaviors;

    // Rendering
    if (isDefined(instancingGeometry)) params.instancingGeometry = instancingGeometry;
    if (isDefined(renderMode)) params.renderMode = renderMode;
    if (isDefined(rendererEmitterSettings)) params.rendererEmitterSettings = rendererEmitterSettings;
    if (isDefined(speedFactor)) params.speedFactor = speedFactor;
    if (isDefined(layers)) params.layers = layers;

    // Tiling
    if (isDefined(uTileCount)) params.uTileCount = uTileCount;
    if (isDefined(vTileCount)) params.vTileCount = vTileCount;
    if (isDefined(blendTiles)) params.blendTiles = blendTiles;

    // Soft particles
    if (isDefined(softParticles)) params.softParticles = softParticles;
    if (isDefined(softNearFade)) params.softNearFade = softNearFade;
    if (isDefined(softFarFade)) params.softFarFade = softFarFade;

    // Ordering
    if (isDefined(renderOrder)) params.renderOrder = renderOrder;

    // Transform
    if (isDefined(worldSpace)) params.worldSpace = worldSpace;
    if (isDefined(onlyUsedByOther)) params.onlyUsedByOther = onlyUsedByOther;

    return params;
}

/**
 * Create a stable dependency key from props for memoization
 */
function getConfigKey(props: ParticleSystemProps): string {
    // Include all configuration props that would require recreating the system
    return JSON.stringify({
        autoDestroy: props.autoDestroy,
        looping: props.looping,
        prewarm: props.prewarm,
        duration: props.duration,
        renderMode: props.renderMode,
        uTileCount: props.uTileCount,
        vTileCount: props.vTileCount,
        blendTiles: props.blendTiles,
        softParticles: props.softParticles,
        worldSpace: props.worldSpace,
        onlyUsedByOther: props.onlyUsedByOther,
        // Note: shape, behaviors, materials are reference-based
        // Users should memoize these themselves
    });
}

/**
 * Hook for creating and managing a particle system imperatively.
 *
 * Auto-registers with BatchedRenderer and cleans up on unmount.
 *
 * @param props - ParticleSystemProps configuration
 * @returns Object with system, emitter, and control functions
 *
 * @example
 * ```tsx
 * function MyParticles() {
 *   const { system, emitter, play, pause, restart } = useParticleSystem({
 *     duration: 5,
 *     looping: true,
 *     startLife: [1, 2],
 *     startSpeed: 5,
 *     emissionOverTime: 100,
 *   })
 *
 *   return <primitive object={emitter} position={[0, 1, 0]} />
 * }
 * ```
 */
export function useParticleSystem(props: ParticleSystemProps): UseParticleSystemReturn {
    const { batchedRenderer } = useQuarks();
    const systemRef = useRef<ParticleSystem | null>(null);
    const configKey = getConfigKey(props);

    // Create system with memoization based on config
    const system = useMemo(() => {
        // Clean up old system if exists
        if (systemRef.current) {
            batchedRenderer.deleteSystem(systemRef.current);
        }

        const params = propsToParameters(props);
        const newSystem = new ParticleSystem(params);
        batchedRenderer.addSystem(newSystem);
        systemRef.current = newSystem;

        // Handle autoPlay (default true)
        if (props.autoPlay === false) {
            newSystem.pause();
        }

        return newSystem;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchedRenderer, configKey]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (systemRef.current) {
                batchedRenderer.deleteSystem(systemRef.current);
                systemRef.current = null;
            }
        };
    }, [batchedRenderer]);

    // Control functions
    const play = useCallback(() => {
        systemRef.current?.play();
    }, []);

    const pause = useCallback(() => {
        systemRef.current?.pause();
    }, []);

    const restart = useCallback(() => {
        systemRef.current?.restart();
    }, []);

    const stop = useCallback(() => {
        systemRef.current?.stop();
    }, []);

    return {
        system,
        emitter: system.emitter,
        play,
        pause,
        restart,
        stop,
    };
}
