/*
 * three.quarks renderer benchmark: WebGLRenderer vs WebGPURenderer.
 *
 * Every frame is split into
 *   sim    – particle simulation (ParticleSystem.update, identical for every renderer)
 *   fill   – batch fill: particles -> interleaved instance buffers (VFXBatch.update)
 *   submit – renderer.render(): uploads + command encoding / GL calls (main-thread CPU)
 *   gpu    – GPU time of the frame (WebGPU timestamp queries / EXT_disjoint_timer_query_webgl2)
 *
 * URL parameters: ?auto=1 runs the default matrix, ?cases=<json> runs a custom matrix.
 */
import {
    BoxGeometry,
    DepthFormat,
    DepthTexture,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    AdditiveBlending,
    NormalBlending,
    PerspectiveCamera,
    PlaneGeometry,
    PointLight,
    AmbientLight,
    Scene,
    Color,
    TextureLoader,
    UnsignedShortType,
    WebGLRenderer,
    WebGLRenderTarget,
    Vector4,
} from 'three';
import {WebGPURenderer, UnsignedByteType, HalfFloatType, LinearSRGBColorSpace} from 'three/webgpu';
import * as quarks from 'three.quarks';
import * as quarksWebGPU from 'three.quarks/webgpu';

const RENDERERS = {
    webgl: 'WebGL (three.quarks, this branch)',
    'webgl-legacy': 'WebGL (three.quarks 0.17.1, npm)',
    webgpu: 'WebGPU (three.quarks/webgpu)',
    'webgpu-webgl2': 'WebGPURenderer, WebGL2 fallback backend',
    'webgpu-prev': 'WebGPU (baseline build, A/B)',
};

const SCENARIOS = {
    billboard: {label: 'Billboards (additive, textured)', renderMode: 'BillBoard'},
    stretched: {label: 'Stretched billboards', renderMode: 'StretchedBillBoard'},
    mesh: {label: 'Lit mesh particles (MeshStandardMaterial)', renderMode: 'Mesh'},
    trail: {label: 'Trails (30 segments)', renderMode: 'Trail'},
    soft: {label: 'Soft particles + 400 opaque meshes', renderMode: 'BillBoard'},
    batches: {label: '50 batches (distinct textures)', renderMode: 'BillBoard'},
};

/**
 * three r187 restarts a render pass after a mid-pass framebuffer copy (e.g. the depth copy of soft particles)
 * with the same timestamp query slots, so `resolveTimestampsAsync()` only times the last segment. Give the
 * resumed pass its own slots; the query pool sums all of them. (Benchmark-only patch, reported upstream.)
 */
function patchSplitPassTimestamps(renderer) {
    const backend = renderer.backend;
    if (!backend.isWebGPUBackend || !backend.trackTimestamp || backend.__quarksTimestampPatch) return;
    backend.__quarksTimestampPatch = true;
    const original = backend.copyFramebufferToTexture.bind(backend);
    backend.copyFramebufferToTexture = function (texture, renderContext, rectangle) {
        const data = backend.get(renderContext);
        const pool = backend.timestampQueryPool && backend.timestampQueryPool.render;
        if (data && data.currentPass && data.descriptor && data.descriptor.timestampWrites && pool) {
            // the pool groups slots per frame through the uid's ":f<frame>" suffix
            const uid = backend.getTimestampUID(renderContext).replace(/:f(\d+)$/, '_resumed:f$1');
            const base = pool.allocateQueriesForContext(uid);
            if (base !== null && base !== undefined) {
                data.descriptor.timestampWrites = {
                    querySet: pool.querySet,
                    beginningOfPassWriteIndex: base,
                    endOfPassWriteIndex: base + 1,
                };
            }
        }
        return original(texture, renderContext, rectangle);
    };
}

let prevModulePromise = null;
async function loadPrev() {
    // only available when the showcase was built with `--prev <dist>`
    const specifier = 'three.quarks-prev/webgpu';
    if (!prevModulePromise) prevModulePromise = import(/* @vite-ignore */ specifier);
    return prevModulePromise;
}

let legacyModulePromise = null;
async function loadLegacy() {
    // resolved through the import map of the static showcase page; not available under Vite dev
    const specifier = 'three.quarks-legacy';
    if (!legacyModulePromise) legacyModulePromise = import(/* @vite-ignore */ specifier);
    return legacyModulePromise;
}

const textureCache = new Map();
function loadTexture(url) {
    if (!textureCache.has(url)) {
        textureCache.set(url, new Promise((resolve) => new TextureLoader().load(url, resolve, undefined, () => resolve(null))));
    }
    return textureCache.get(url);
}

function median(values) {
    if (values.length === 0) return NaN;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Mean of the central 80% of the samples. `performance.now()` is quantized (0.1 ms without
 * cross-origin isolation), so a trimmed mean resolves sub-quantum differences that a median hides.
 */
function trimmedMean(values) {
    if (values.length === 0) return NaN;
    const sorted = [...values].sort((a, b) => a - b);
    const cut = Math.floor(sorted.length * 0.1);
    const kept = sorted.slice(cut, sorted.length - cut);
    return kept.reduce((a, b) => a + b, 0) / kept.length;
}

function buildSystems(lib, scenario, count, texture) {
    const {
        ParticleSystem,
        ConstantValue,
        IntervalValue,
        ConstantColor,
        SphereEmitter,
        ConeEmitter,
        RenderMode,
        SizeOverLife,
        RotationOverLife,
        PiecewiseBezier,
        Bezier,
        RandomQuatGenerator,
    } = lib;
    const systems = [];
    const systemCount = scenario === 'trail' ? 10 : scenario === 'batches' ? 50 : 20;
    const perSystem = Math.max(1, Math.round(count / systemCount));
    const life = 4;
    for (let i = 0; i < systemCount; i++) {
        let material;
        let instancingGeometry;
        let startRotation = new IntervalValue(0, Math.PI);
        if (scenario === 'mesh') {
            material = new MeshStandardMaterial({color: 0xffaa55, roughness: 0.4, metalness: 0.2});
            instancingGeometry = new BoxGeometry(1, 1, 1);
            startRotation = new RandomQuatGenerator();
        } else {
            material = new MeshBasicMaterial({
                // 'batches': a distinct texture object per system => one batch (and material) per system
                map: scenario === 'batches' && texture ? texture.clone() : texture,
                blending: scenario === 'soft' ? NormalBlending : AdditiveBlending,
                transparent: true,
                side: DoubleSide,
            });
        }
        const ps = new ParticleSystem({
            duration: life,
            looping: true,
            prewarm: true,
            startLife: new ConstantValue(life),
            startSpeed: new IntervalValue(1, 4),
            startSize: scenario === 'mesh' ? new IntervalValue(0.1, 0.3) : new IntervalValue(0.3, 1.2),
            startRotation,
            startColor: new ConstantColor(new Vector4(1, 0.7, 0.4, 0.8)),
            worldSpace: scenario === 'trail',
            maxParticle: perSystem * 2,
            emissionOverTime: new ConstantValue(perSystem / life),
            shape: scenario === 'trail' ? new ConeEmitter({radius: 0.5, angle: 0.6}) : new SphereEmitter({radius: 3}),
            material,
            instancingGeometry,
            renderMode: RenderMode[SCENARIOS[scenario].renderMode],
            rendererEmitterSettings:
                scenario === 'trail'
                    ? {startLength: new ConstantValue(30)}
                    : scenario === 'stretched'
                      ? {speedFactor: 0.2, lengthFactor: 1}
                      : {},
            softParticles: scenario === 'soft',
            softNearFade: 0,
            softFarFade: 1.5,
        });
        ps.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.9, 0.6, 0.2), 0]])));
        if (scenario !== 'mesh' && scenario !== 'trail') ps.addBehavior(new RotationOverLife(new ConstantValue(1)));
        const angle = (i / systemCount) * Math.PI * 2;
        ps.emitter.position.set(Math.cos(angle) * 8, scenario === 'soft' ? -2.5 : 0, Math.sin(angle) * 8);
        if (scenario === 'trail') ps.emitter.rotation.set(-Math.PI / 2, 0, 0);
        systems.push(ps);
    }
    return systems;
}

function buildOpaqueScene(scene, heavy) {
    const ground = new Mesh(new PlaneGeometry(200, 200), new MeshStandardMaterial({color: 0x333333}));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    scene.add(ground);
    scene.add(new AmbientLight(0xffffff, 0.6));
    const light = new PointLight(0xffffff, 400, 200);
    light.position.set(0, 12, 6);
    scene.add(light);
    if (heavy) {
        const geo = new BoxGeometry(0.8, 0.8, 0.8);
        const mat = new MeshStandardMaterial({color: 0x557799});
        for (let i = 0; i < 400; i++) {
            const m = new Mesh(geo, mat);
            m.position.set((Math.random() - 0.5) * 30, -2.6 + Math.random() * 2, (Math.random() - 0.5) * 30);
            m.rotation.set(Math.random(), Math.random(), Math.random());
            scene.add(m);
        }
    }
}

/**
 * Runs one benchmark case and resolves with its statistics.
 */
export async function runCase(
    {renderer: rendererKind, scenario, count, target = 'desktop', frames = 240, width = 960, height = 540, outputBuffer, directOutput, profile},
    host
) {
    const canvas = document.createElement('canvas');
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.style.maxWidth = '100%';
    host.innerHTML = '';
    host.appendChild(canvas);

    const isWebGPURenderer = rendererKind === 'webgpu' || rendererKind === 'webgpu-webgl2' || rendererKind === 'webgpu-prev';
    let lib = quarks;
    if (rendererKind === 'webgl-legacy') lib = await loadLegacy();
    if (isWebGPURenderer) lib = rendererKind === 'webgpu-prev' ? await loadPrev() : quarksWebGPU;

    let renderer;
    let gpuTimer = null;
    if (isWebGPURenderer) {
        renderer = new WebGPURenderer({
            canvas,
            antialias: false,
            trackTimestamp: true,
            forceWebGL: rendererKind === 'webgpu-webgl2',
            outputBufferType: outputBuffer === 'ubyte' ? UnsignedByteType : HalfFloatType,
        });
        await renderer.init();
        patchSplitPassTimestamps(renderer);
        // diagnostic only: skip the linear half-float framebuffer + output pass (colors will look wrong)
        if (directOutput) renderer.outputColorSpace = LinearSRGBColorSpace;
    } else {
        renderer = new WebGLRenderer({canvas, antialias: false});
        const gl = renderer.getContext();
        const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
        if (ext) gpuTimer = {gl, ext, pending: []};
    }
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);

    const scene = new Scene();
    scene.background = new Color(0x000000);
    const camera = new PerspectiveCamera(60, width / height, 0.5, 200);
    camera.position.set(0, 12, 22);
    camera.lookAt(0, 0, 0);
    buildOpaqueScene(scene, scenario === 'soft');

    const texture = await loadTexture(scenario === 'soft' ? 'textures/cfxr smoke cloud x4.png' : 'textures/particle_default.png');
    const BatchedRendererClass = isWebGPURenderer ? lib.WebGPUBatchedRenderer : lib.BatchedRenderer;
    const batchRenderer = isWebGPURenderer ? new BatchedRendererClass({target, ...(profile || {})}) : new BatchedRendererClass();
    scene.add(batchRenderer);
    const systems = buildSystems(lib, scenario, count, texture);
    for (const ps of systems) {
        batchRenderer.addSystem(ps);
        scene.add(ps.emitter);
    }

    // WebGL soft particles need a depth pre-pass into a render target (as in softParticleDemo.js)
    let depthTarget = null;
    if (scenario === 'soft' && !isWebGPURenderer) {
        depthTarget = new WebGLRenderTarget(width, height);
        depthTarget.depthTexture = new DepthTexture(width, height);
        depthTarget.depthTexture.type = UnsignedShortType;
        depthTarget.depthTexture.format = DepthFormat;
        batchRenderer.setDepthTexture(depthTarget.depthTexture);
    }

    // time to build every material / pipeline of the scene (shader builds dominate with many batches)
    const compileStart = performance.now();
    if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
    const compileMs = performance.now() - compileStart;

    const stats = {sim: [], fill: [], submit: [], cpu: [], gpu: [], frameTimes: [], drawCalls: 0};
    const delta = 1 / 60;
    let lastTime = 0;

    const renderFrame = (record) => {
        const t0 = performance.now();
        for (const ps of systems) ps.update(delta);
        const t1 = performance.now();
        for (const batch of batchRenderer.batches) batch.update();
        const t2 = performance.now();
        let query = null;
        if (record && gpuTimer) {
            query = gpuTimer.gl.createQuery();
            gpuTimer.gl.beginQuery(gpuTimer.ext.TIME_ELAPSED_EXT, query);
        }
        if (depthTarget) {
            renderer.setRenderTarget(depthTarget);
            batchRenderer.visible = false;
            renderer.render(scene, camera);
            batchRenderer.visible = true;
            renderer.setRenderTarget(null);
        }
        renderer.render(scene, camera);
        if (query) {
            gpuTimer.gl.endQuery(gpuTimer.ext.TIME_ELAPSED_EXT);
            gpuTimer.pending.push(query);
        }
        const t3 = performance.now();
        if (record) {
            stats.drawCalls = renderer.info.render.drawCalls ?? renderer.info.render.calls;
            stats.sim.push(t1 - t0);
            stats.fill.push(t2 - t1);
            stats.submit.push(t3 - t2);
            stats.cpu.push(t3 - t0);
        }
    };

    const pollGL = () => {
        if (!gpuTimer) return;
        const {gl, ext, pending} = gpuTimer;
        while (pending.length) {
            const q = pending[0];
            if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break;
            if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) stats.gpu.push(gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6);
            gl.deleteQuery(q);
            pending.shift();
        }
    };

    await new Promise((resolve) => {
        let frame = 0;
        const warmup = 60;
        const loop = async (time) => {
            const record = frame >= warmup;
            renderFrame(record);
            if (record && lastTime) stats.frameTimes.push(time - lastTime);
            lastTime = time;
            if (isWebGPURenderer && record) {
                renderer.resolveTimestampsAsync('render').then((ms) => {
                    if (typeof ms === 'number' && ms > 0) stats.gpu.push(ms);
                });
            }
            pollGL();
            frame++;
            if (frame < warmup + frames) requestAnimationFrame(loop);
            else setTimeout(resolve, 300);
        };
        requestAnimationFrame(loop);
    });
    pollGL();

    // Synced render time: render() + wait for the GPU to finish. Covers every pass on both APIs
    // (WebGPU timestamp queries only cover the last segment of a render pass that was split by a
    // mid-frame framebuffer copy, e.g. the depth copy used by soft particles).
    const syncSamples = [];
    const pixel = new Uint8Array(4);
    for (let i = 0; i < 60; i++) {
        for (const ps of systems) ps.update(delta);
        for (const batch of batchRenderer.batches) batch.update();
        const t0 = performance.now();
        if (depthTarget) {
            renderer.setRenderTarget(depthTarget);
            batchRenderer.visible = false;
            renderer.render(scene, camera);
            batchRenderer.visible = true;
            renderer.setRenderTarget(null);
        }
        renderer.render(scene, camera);
        if (isWebGPURenderer && renderer.backend.device) {
            await renderer.backend.device.queue.onSubmittedWorkDone();
        } else {
            const gl = renderer.getContext();
            gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        }
        syncSamples.push(performance.now() - t0);
        if (i % 10 === 9) await new Promise((r) => requestAnimationFrame(r));
    }

    let particles = 0;
    for (const ps of systems) particles += ps.particleNum;
    const result = {
        renderer: rendererKind,
        rendererLabel: RENDERERS[rendererKind],
        backend: isWebGPURenderer ? (renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2') : 'WebGL2',
        scenario,
        target: isWebGPURenderer ? batchRenderer.profile.target + (outputBuffer === 'ubyte' ? '/u8' : '') + (directOutput ? '/direct' : '') + (profile ? '/' + JSON.stringify(profile) : '') : '-',
        particles,
        drawCalls: stats.drawCalls,
        simMs: trimmedMean(stats.sim),
        fillMs: trimmedMean(stats.fill),
        submitMs: trimmedMean(stats.submit),
        cpuMs: trimmedMean(stats.cpu),
        gpuMs: trimmedMean(stats.gpu),
        syncMs: trimmedMean(syncSamples),
        compileMs,
        fps: 1000 / median(stats.frameTimes),
    };

    // cleanup
    if (batchRenderer.dispose) batchRenderer.dispose();
    if (depthTarget) depthTarget.dispose();
    renderer.setAnimationLoop && renderer.setAnimationLoop(null);
    renderer.dispose();
    host.innerHTML = '';
    return result;
}

export const DEFAULT_MATRIX = [
    ...['webgl-legacy', 'webgl', 'webgpu'].flatMap((renderer) =>
        [10000, 50000].map((count) => ({renderer, scenario: 'billboard', count}))
    ),
    ...['webgl-legacy', 'webgl', 'webgpu'].map((renderer) => ({renderer, scenario: 'stretched', count: 20000})),
    ...['webgl', 'webgpu'].map((renderer) => ({renderer, scenario: 'mesh', count: 5000})),
    ...['webgl-legacy', 'webgl', 'webgpu'].map((renderer) => ({renderer, scenario: 'trail', count: 400})),
    ...['webgl', 'webgpu'].map((renderer) => ({renderer, scenario: 'soft', count: 3000})),
    {renderer: 'webgpu', scenario: 'soft', count: 3000, target: 'mobile'},
    {renderer: 'webgpu-webgl2', scenario: 'billboard', count: 50000},
    // half-float instance data (native Float16Array)
    ...[
        {scenario: 'billboard', count: 10000},
        {scenario: 'billboard', count: 50000},
        {scenario: 'stretched', count: 20000},
        {scenario: 'mesh', count: 5000},
    ].map((c) => ({renderer: 'webgpu', ...c, profile: {halfFloat: true}})),
];

export async function runMatrix(cases, host, onResult) {
    const results = [];
    for (const c of cases) {
        try {
            const r = await runCase(c, host);
            results.push(r);
            onResult && onResult(r, null);
        } catch (error) {
            console.error(error);
            onResult && onResult({...c, error: String(error)}, error);
        }
    }
    return results;
}

export {RENDERERS, SCENARIOS};
