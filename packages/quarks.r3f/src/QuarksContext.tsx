import React, {
    createContext,
    useContext,
    useRef,
    useEffect,
    ReactNode,
} from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { BatchedRenderer } from 'three.quarks';
import type { QuarksContextValue } from './types';

/**
 * React context for sharing the BatchedRenderer across components
 */
const QuarksContext = createContext<QuarksContextValue | null>(null);

/**
 * Props for QuarksProvider
 */
export interface QuarksProviderProps {
    children: ReactNode;
}

/**
 * Provider component that manages a singleton BatchedRenderer for the scene.
 *
 * Wrap your particle system components with this provider inside the R3F Canvas.
 *
 * @example
 * ```tsx
 * import { Canvas } from '@react-three/fiber'
 * import { QuarksProvider, ParticleSystem } from 'quarks.r3f'
 *
 * function App() {
 *   return (
 *     <Canvas>
 *       <QuarksProvider>
 *         <ParticleSystem {...props} />
 *       </QuarksProvider>
 *     </Canvas>
 *   )
 * }
 * ```
 */
export function QuarksProvider({ children }: QuarksProviderProps) {
    const { scene } = useThree();
    const rendererRef = useRef<BatchedRenderer | null>(null);
    const contextRef = useRef<QuarksContextValue | null>(null);

    // Create renderer once (synchronously to avoid flicker)
    if (!rendererRef.current) {
        rendererRef.current = new BatchedRenderer();
        scene.add(rendererRef.current);
        contextRef.current = { batchedRenderer: rendererRef.current };
    }

    // Update all particle systems each frame
    useFrame((_, delta) => {
        rendererRef.current?.update(delta);
    });

    // Cleanup on unmount
    useEffect(() => {
        const renderer = rendererRef.current;
        return () => {
            if (renderer) {
                scene.remove(renderer);
                // Dispose all batches
                renderer.batches.forEach((batch) => batch.dispose());
            }
        };
    }, [scene]);

    return (
        <QuarksContext.Provider value={contextRef.current!}>
            {children}
        </QuarksContext.Provider>
    );
}

/**
 * Hook to access the BatchedRenderer from context.
 *
 * Must be used within a QuarksProvider.
 *
 * @returns The QuarksContextValue containing the batchedRenderer
 * @throws Error if used outside of QuarksProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { batchedRenderer } = useQuarks()
 *   // Use batchedRenderer for advanced operations
 *   batchedRenderer.setDepthTexture(depthTexture)
 * }
 * ```
 */
export function useQuarks(): QuarksContextValue {
    const context = useContext(QuarksContext);
    if (!context) {
        throw new Error(
            'useQuarks must be used within a QuarksProvider. ' +
            'Wrap your particle system components with <QuarksProvider>.'
        );
    }
    return context;
}
