import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
    QuarksProvider,
    ParticleSystem,
    QuarksEffect,
} from 'quarks.r3f';
import {
    ConeEmitter,
    SphereEmitter,
    SizeOverLife,
    ColorOverLife,
    SpeedOverLife,
    RotationOverLife,
    Bezier,
    PiecewiseBezier,
    Gradient,
    RenderMode,
    Vector4,
} from 'three.quarks';

// Load textures
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/textures/texture1.png');
const smokeTexture = textureLoader.load('/textures/cfxr smoke cloud x4.png');

/**
 * Fire particles - orange/yellow with size fade
 */
function FireParticles({ systemRef }) {
    const material = useMemo(() => new THREE.MeshBasicMaterial({
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
    }), []);

    const shape = useMemo(() => new ConeEmitter({
        angle: 0.3,
        radius: 0.2,
        thickness: 1,
        arc: Math.PI * 2,
    }), []);

    const behaviors = useMemo(() => [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.4, 0), 0]])),
        new ColorOverLife(new Gradient([
            [new Vector4(1, 0.8, 0.2, 1), 0],
            [new Vector4(1, 0.3, 0.1, 1), 0.5],
            [new Vector4(0.5, 0.1, 0.1, 0), 1],
        ])),
    ], []);

    return (
        <ParticleSystem
            ref={systemRef}
            duration={5}
            looping
            startLife={[0.8, 1.5]}
            startSpeed={[2, 4]}
            startSize={[0.3, 0.6]}
            startColor={{ r: 1, g: 0.6, b: 0.2, a: 1 }}
            emissionOverTime={40}
            shape={shape}
            material={material}
            renderMode={RenderMode.BillBoard}
            behaviors={behaviors}
            uTileCount={10}
            vTileCount={10}
            worldSpace={false}
            position={[-2, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            autoPlay
        />
    );
}

/**
 * Smoke particles - gray with slow rise and fade
 */
function SmokeParticles({ systemRef }) {
    const material = useMemo(() => new THREE.MeshBasicMaterial({
        map: smokeTexture,
        transparent: true,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
    }), []);

    const shape = useMemo(() => new ConeEmitter({
        angle: 0.2,
        radius: 0.3,
        thickness: 1,
        arc: Math.PI * 2,
    }), []);

    const behaviors = useMemo(() => [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.3, 0.6, 0.8, 1), 0]])),
        new ColorOverLife(new Gradient([
            [new Vector4(0.4, 0.4, 0.4, 0), 0],
            [new Vector4(0.5, 0.5, 0.5, 0.6), 0.2],
            [new Vector4(0.6, 0.6, 0.6, 0.3), 0.7],
            [new Vector4(0.7, 0.7, 0.7, 0), 1],
        ])),
        new RotationOverLife(new PiecewiseBezier([[new Bezier(0, 0.5, 1, 1.5), 0]])),
    ], []);

    return (
        <ParticleSystem
            ref={systemRef}
            duration={5}
            looping
            startLife={[2, 4]}
            startSpeed={[0.5, 1]}
            startSize={[0.6, 1.0]}
            startRotation={[0, Math.PI * 2]}
            startColor={{ r: 0.5, g: 0.5, b: 0.5, a: 0.5 }}
            emissionOverTime={15}
            shape={shape}
            material={material}
            renderMode={RenderMode.BillBoard}
            behaviors={behaviors}
            uTileCount={2}
            vTileCount={2}
            worldSpace={false}
            position={[-2, 1.2, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            autoPlay
        />
    );
}

/**
 * Spark particles - bright yellow sparks shooting up
 */
function SparkParticles({ systemRef }) {
    const material = useMemo(() => new THREE.MeshBasicMaterial({
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
    }), []);

    const shape = useMemo(() => new ConeEmitter({
        angle: 0.5,
        radius: 0.1,
        thickness: 1,
        arc: Math.PI * 2,
    }), []);

    const behaviors = useMemo(() => [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.3, 0), 0]])),
        new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.5, 0.2, 0), 0]])),
    ], []);

    return (
        <ParticleSystem
            ref={systemRef}
            duration={5}
            looping
            startLife={[0.5, 1]}
            startSpeed={[5, 8]}
            startSize={[0.1, 0.2]}
            startColor={{ r: 1, g: 1, b: 0.5, a: 1 }}
            emissionOverTime={20}
            shape={shape}
            material={material}
            renderMode={RenderMode.BillBoard}
            behaviors={behaviors}
            uTileCount={10}
            vTileCount={10}
            worldSpace={false}
            position={[-2, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            autoPlay
        />
    );
}

/**
 * Magic orb - spherical emission with color cycling
 */
function MagicOrb({ systemRef }) {
    const material = useMemo(() => new THREE.MeshBasicMaterial({
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
    }), []);

    const shape = useMemo(() => new SphereEmitter({
        radius: 0.5,
        thickness: 0.2,
        arc: Math.PI * 2,
    }), []);

    const behaviors = useMemo(() => [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0, 1, 1, 0), 0]])),
        new ColorOverLife(new Gradient([
            [new Vector4(0.2, 0.5, 1, 1), 0],
            [new Vector4(0.8, 0.2, 1, 1), 0.5],
            [new Vector4(0.2, 0.8, 1, 0), 1],
        ])),
    ], []);

    return (
        <ParticleSystem
            ref={systemRef}
            duration={5}
            looping
            startLife={[1, 2]}
            startSpeed={[0.5, 1]}
            startSize={[0.2, 0.4]}
            startColor={{ r: 0.5, g: 0.5, b: 1, a: 1 }}
            emissionOverTime={50}
            shape={shape}
            material={material}
            renderMode={RenderMode.BillBoard}
            behaviors={behaviors}
            uTileCount={10}
            vTileCount={10}
            worldSpace={false}
            position={[0, 1, 0]}
            autoPlay
        />
    );
}

/**
 * Fountain - water-like particles with gravity
 */
function Fountain({ systemRef }) {
    const material = useMemo(() => new THREE.MeshBasicMaterial({
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
    }), []);

    const shape = useMemo(() => new ConeEmitter({
        angle: 0.15,
        radius: 0.05,
        thickness: 1,
        arc: Math.PI * 2,
    }), []);

    const behaviors = useMemo(() => [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1, 0.8, 0), 0]])),
        new ColorOverLife(new Gradient([
            [new Vector4(0.3, 0.6, 1, 1), 0],
            [new Vector4(0.5, 0.8, 1, 0.8), 0.5],
            [new Vector4(0.7, 0.9, 1, 0), 1],
        ])),
    ], []);

    return (
        <ParticleSystem
            ref={systemRef}
            duration={5}
            looping
            startLife={[1.5, 2.5]}
            startSpeed={[4, 6]}
            startSize={[0.15, 0.25]}
            startColor={{ r: 0.4, g: 0.7, b: 1, a: 1 }}
            emissionOverTime={60}
            shape={shape}
            material={material}
            renderMode={RenderMode.BillBoard}
            behaviors={behaviors}
            uTileCount={10}
            vTileCount={10}
            worldSpace
            position={[2, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            autoPlay
        />
    );
}

/**
 * Acid Boiling Effect - loaded from JSON file using QuarksEffect
 */
function AcidBoilingEffect({ effectRef }) {
    return (
        <Suspense fallback={null}>
            <QuarksEffect
                ref={effectRef}
                url="/AcidBoiling.json"
                position={[-4, 0, 0]}
                autoPlay
            />
        </Suspense>
    );
}

/**
 * All particle systems
 */
function ParticleSystems({ refs }) {
    return (
        <QuarksProvider>
            <FireParticles systemRef={refs.fire} />
            <SmokeParticles systemRef={refs.smoke} />
            <SparkParticles systemRef={refs.sparks} />
            <MagicOrb systemRef={refs.orb} />
            <Fountain systemRef={refs.fountain} />
            <AcidBoilingEffect effectRef={refs.acidBoiling} />
        </QuarksProvider>
    );
}

/**
 * Scene
 */
function Scene({ refs }) {
    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[-4, 2, 0]} intensity={20} color="#66ff00" />
            <pointLight position={[-2, 2, 0]} intensity={30} color="#ff6600" />
            <pointLight position={[0, 2, 0]} intensity={20} color="#6666ff" />
            <pointLight position={[2, 2, 0]} intensity={20} color="#00aaff" />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#222233" />
            </mesh>

            <ParticleSystems refs={refs} />

            <OrbitControls />
        </>
    );
}

function App() {
    const refs = {
        fire: useRef(null),
        smoke: useRef(null),
        sparks: useRef(null),
        orb: useRef(null),
        fountain: useRef(null),
        acidBoiling: useRef(null),
    };

    useEffect(() => {
        const playAll = () => Object.values(refs).forEach(ref => ref.current?.play());
        const pauseAll = () => Object.values(refs).forEach(ref => ref.current?.pause());
        const restartAll = () => Object.values(refs).forEach(ref => ref.current?.restart());

        document.getElementById('playBtn')?.addEventListener('click', playAll);
        document.getElementById('pauseBtn')?.addEventListener('click', pauseAll);
        document.getElementById('restartBtn')?.addEventListener('click', restartAll);

        return () => {
            document.getElementById('playBtn')?.removeEventListener('click', playAll);
            document.getElementById('pauseBtn')?.removeEventListener('click', pauseAll);
            document.getElementById('restartBtn')?.removeEventListener('click', restartAll);
        };
    }, []);

    return (
        <Canvas
            camera={{ position: [0, 4, 10], fov: 60 }}
            style={{ background: '#171717' }}
        >
            <Scene refs={refs} />
        </Canvas>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
