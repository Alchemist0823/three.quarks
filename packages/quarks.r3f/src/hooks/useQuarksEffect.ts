import { useRef, useEffect, useCallback, useMemo } from 'react';
import { Group, Object3D } from 'three';
import { QuarksLoader, ParticleSystem, ParticleEmitter } from 'three.quarks';
import { useQuarks } from '../QuarksContext';
import type { UseQuarksEffectReturn } from '../types';

// Cache for loaded effects and promises (for Suspense)
const effectCache = new Map<string, Object3D>();
const promiseCache = new Map<string, Promise<Object3D>>();

/**
 * Load effect from URL (with caching)
 */
function loadEffect(url: string): Promise<Object3D> {
    // Return cached result if available
    if (effectCache.has(url)) {
        return Promise.resolve(effectCache.get(url)!);
    }

    // Return pending promise if loading
    if (promiseCache.has(url)) {
        return promiseCache.get(url)!;
    }

    // Start new load
    const loader = new QuarksLoader();
    const promise = new Promise<Object3D>((resolve, reject) => {
        loader.load(
            url,
            (object) => {
                effectCache.set(url, object);
                promiseCache.delete(url);
                resolve(object);
            },
            undefined,
            (error) => {
                promiseCache.delete(url);
                reject(error);
            }
        );
    });

    promiseCache.set(url, promise);
    return promise;
}

/**
 * Collect all ParticleSystems from an object tree
 */
function collectSystems(object: Object3D): ParticleSystem[] {
    const systems: ParticleSystem[] = [];
    object.traverse((child) => {
        if (child.type === 'ParticleEmitter') {
            const emitter = child as ParticleEmitter;
            if (emitter.system) {
                systems.push(emitter.system as ParticleSystem);
            }
        }
    });
    return systems;
}

/**
 * Hook for loading JSON particle effects with Suspense support.
 *
 * @param url - URL to the JSON effect file
 * @returns Object with group, systems array, and control functions
 * @throws Promise (for Suspense) if the effect is still loading
 *
 * @example
 * ```tsx
 * import { Suspense } from 'react'
 * import { useQuarksEffect } from 'quarks.r3f'
 *
 * function MyEffect() {
 *   const { group, systems, play, pause } = useQuarksEffect('/effects/explosion.json')
 *   return <primitive object={group} />
 * }
 *
 * // In parent:
 * <Suspense fallback={null}>
 *   <MyEffect />
 * </Suspense>
 * ```
 */
export function useQuarksEffect(url: string): UseQuarksEffectReturn {
    const { batchedRenderer } = useQuarks();
    const groupRef = useRef<Group | null>(null);
    const systemsRef = useRef<ParticleSystem[]>([]);
    const registeredRef = useRef(false);

    // Suspense-compatible loading
    // If not cached, throw a promise to suspend
    if (!effectCache.has(url)) {
        throw loadEffect(url);
    }

    // Get the cached loaded object
    const loadedObject = effectCache.get(url)!;

    // Create a clone for this instance (so multiple uses don't share state)
    const group = useMemo(() => {
        const cloned = loadedObject.clone() as Group;
        groupRef.current = cloned;
        return cloned;
    }, [loadedObject]);

    // Collect and register systems
    const systems = useMemo(() => {
        const collected = collectSystems(group);
        systemsRef.current = collected;
        return collected;
    }, [group]);

    // Register all systems with BatchedRenderer
    useEffect(() => {
        if (registeredRef.current) return;

        systems.forEach((system) => {
            batchedRenderer.addSystem(system);
        });
        registeredRef.current = true;

        return () => {
            systems.forEach((system) => {
                batchedRenderer.deleteSystem(system);
            });
            registeredRef.current = false;
        };
    }, [batchedRenderer, systems]);

    // Control functions
    const play = useCallback(() => {
        systemsRef.current.forEach((system) => system.play());
    }, []);

    const pause = useCallback(() => {
        systemsRef.current.forEach((system) => system.pause());
    }, []);

    const restart = useCallback(() => {
        systemsRef.current.forEach((system) => system.restart());
    }, []);

    return {
        group,
        systems,
        play,
        pause,
        restart,
    };
}

/**
 * Preload an effect URL (useful for avoiding loading spinners)
 *
 * @example
 * ```tsx
 * // Preload before rendering
 * useQuarksEffect.preload('/effects/explosion.json')
 * ```
 */
useQuarksEffect.preload = function preload(url: string): void {
    loadEffect(url);
};

/**
 * Clear a specific URL from the cache
 */
useQuarksEffect.clear = function clear(url: string): void {
    effectCache.delete(url);
    promiseCache.delete(url);
};

/**
 * Clear all cached effects
 */
useQuarksEffect.clearAll = function clearAll(): void {
    effectCache.clear();
    promiseCache.clear();
};
