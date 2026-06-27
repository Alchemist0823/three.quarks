import {IAnimationData, IPrefab} from 'quarks.core';
import {AnimationAction, AnimationClip, AnimationMixer, Clock, Group, LoopOnce, Object3D} from 'three';
import {ParticleEmitter} from './ParticleEmitter';

/**
 * Interface for animation data.
 */
interface AnimationData extends IAnimationData {
    /**
     * Target object.
     */
    target: Object3D;
    /**
     * Type of animation.
     */
    type: 'three' | 'ps';
    /**
     * Animation clip for Three.js animations.
     */
    clip?: AnimationClip;
    /**
     * Mixer for Three.js animations.
     */
    mixer?: AnimationMixer;
    /**
     * Action for Three.js animations.
     */
    action?: AnimationAction;
    /**
     * Whether to loop the animation.
     */
    loop?: boolean;
}

interface AnimationJSON {
    startTime: number;
    duration: number;
    type: 'three' | 'ps';
    targetUUID: string;
    clipUUID?: string;
    loop: boolean;
}

type AnimationTiming = {
    isActive: boolean;
    isEnded: boolean;
    isStartFrame: boolean;
};

/**
 * AnimationPrefab is a class that manages multiple animations in a unified timeline.
 * It can handle both Three.js animations and particle system animations from three.quarks.
 */
export class QuarksPrefab extends Group implements IPrefab {
    readonly type = 'QuarksPrefab';

    private readonly _clock = new Clock(true);
    private readonly _mixers: Map<Object3D, AnimationMixer> = new Map();

    private readonly _mixersToUpdate: Set<AnimationMixer> = new Set();
    private readonly _animationTiming: AnimationTiming = {
        isActive: false,
        isEnded: false,
        isStartFrame: false,
    };

    readonly animationData: AnimationData[] = [];
    private _animationJSON: AnimationJSON[] = [];

    isPlaying: boolean = false;
    currentTime: number = -0.00001;
    timeScale: number = 1;
    duration: number = 0;

    /**
     * Creates a new AnimationPrefab.
     */
    constructor() {
        super();
    }

    /**
     * Add a Three.js animation.
     * @param target - The target object to animate.
     * @param clip - The animation clip.
     * @param startTime - When to start the animation in seconds.
     * @param duration - Duration of the animation in seconds.
     * @param loop - Whether to loop the animation.
     * @returns The animation data.
     */
    addThreeAnimation(
        target: Object3D,
        clip: AnimationClip,
        startTime: number = 0,
        duration: number = clip.duration,
        loop: boolean = false
    ): AnimationData {
        const mixer = this.getOrCreateMixer(target);
        const action = mixer.clipAction(clip);

        if (!loop) {
            action.setLoop(LoopOnce, 1);
            action.clampWhenFinished = true;
        }

        const animation: AnimationData = {
            startTime,
            duration,
            type: 'three',
            loop,
            target,
            clip,
            mixer,
            action,
        };

        this.animationData.push(animation);
        this.updateDuration();

        return animation;
    }

    /**
     * Add a particle system animation.
     * @param emitter - The particle emitter.
     * @param startTime - When to start the animation in seconds.
     * @param duration - Duration of the animation in seconds.
     * @param loop - Whether to loop the animation.
     * @returns The animation data.
     */
    addParticleSystemAnimation(
        emitter: ParticleEmitter,
        startTime: number = 0,
        duration: number = 0,
        loop: boolean = false
    ): AnimationData {
        // If duration is not specified, use the emitter's system duration
        const animationDuration = duration <= 0 ? emitter.system.duration : duration;

        const animation: AnimationData = {
            startTime,
            duration: animationDuration,
            type: 'ps',
            loop,
            target: emitter,
        };

        this.animationData.push(animation);

        // Pause the particle system initially
        this.pause();
        this.updateDuration();

        return animation;
    }

    /**
     * Remove an animation by its index.
     * @param index - The index of the animation to remove.
     */
    removeAnimation(index: number): void {
        this.animationData.splice(index, 1);
        this.updateDuration();
    }

    /**
     * Start playing all animations.
     */
    play(): void {
        if (this.isPlaying) return;
        this.isPlaying = true;
    }

    /**
     * Pause all animations.
     */
    pause(): void {
        if (!this.isPlaying) return;

        this.isPlaying = false;

        for (const animation of this.animationData) {
            if (!animation.target) continue;

            const target = animation.target as ParticleEmitter;

            if (animation.type === 'ps' && !target.system.paused) {
                target.system.pause();
                continue;
            }

            if (animation.type === 'three' && animation.action && animation.action.isRunning()) {
                animation.action.paused = true;
            }
        }
    }

    /**
     * Stop and reset all animations.
     */
    stop(): void {
        this.pause();
        this.currentTime = -0.00001;

        for (const animation of this.animationData) {
            if (animation.type === 'ps' && animation.target) {
                (animation.target as ParticleEmitter).system.stop();
                continue;
            }

            if (animation.type === 'three' && animation.mixer && animation.action) {
                animation.action.reset();
            }
        }
    }

    /**
     * Update animations per frame.
     * @param forceDelta - Optional delta time to force an update.
     */
    update(forceDelta?: number): void {
        if (!this.isPlaying) return;

        const delta = forceDelta !== undefined ? forceDelta : this._clock.getDelta();
        this.currentTime += delta * this.timeScale;

        // Reset or stop if the animation has ended
        if (this.currentTime > this.duration) {
            this.stop();
        }

        // Clear the scratch set before collecting mixer updates
        this._mixersToUpdate.clear();

        for (const animation of this.animationData) {
            const timing = this.writeAnimationTiming(animation, delta);

            if (animation.type === 'three') {
                // Queues active mixers so each shared target mixer updates once per frame.
                this.updateThreeAnimation(animation, timing);
                continue;
            }

            this.updateParticleSystemAnimation(animation, timing);
        }

        for (const mixer of this._mixersToUpdate) {
            mixer.update(delta);
        }
    }

    /**
     * Set the animation time.
     * @param time - Time in seconds.
     */
    setTime(time: number): void {
        const previousTime = this.currentTime;
        this.currentTime = time;

        for (const animation of this.animationData) {
            if (animation.type === 'three') {
                this.setThreeAnimationTime(animation, time);
                continue;
            }

            this.setParticleSystemAnimationTime(animation, time, previousTime);
        }
    }

    /**
     * Get the total duration of all animations.
     */
    getDuration(): number {
        return this.duration;
    }

    /**
     * Find objects in the scene by their UUID.
     * @param root - The root object to search from.
     */
    resolveReferences(root: Object3D): void {
        if (this._animationJSON.length === 0) return;

        const objectsByUuid = new Map<string, Object3D>();
        root.traverse((object) => objectsByUuid.set(object.uuid, object));

        for (const json of this._animationJSON) {
            const target = objectsByUuid.get(json.targetUUID);
            if (!target) continue;

            this.addAnimationFromJSON(json, target);
        }

        this.updateDuration();
        this._animationJSON.length = 0;
    }

    /**
     * Convert to JSON for serialization.
     * @returns The JSON object.
     */
    toJSON(): any {
        const json = super.toJSON();

        (json.object as any).animationData = this.animationData.map((animation) => ({
            startTime: animation.startTime,
            duration: animation.duration,
            type: animation.type,
            targetUUID: animation.target.uuid,
            clipUUID: animation.clip?.uuid,
            loop: animation.loop,
        }));

        return json;
    }

    /**
     * Create an AnimationPrefab from JSON data.
     * @param json - The JSON data.
     * @returns A new QuarksPrefab instance.
     */
    static fromJSON(json: any): QuarksPrefab {
        const prefab = new QuarksPrefab();

        if (json.animationData) {
            prefab._animationJSON = json.animationData;
        }

        return prefab;
    }

    /**
     * Gets or creates an AnimationMixer for a target object.
     * @param target - The target object that needs a mixer.
     * @returns The AnimationMixer for the target.
     */
    private getOrCreateMixer(target: Object3D): AnimationMixer {
        if (!this._mixers.has(target)) {
            this._mixers.set(target, new AnimationMixer(target));
        }

        return this._mixers.get(target)!;
    }

    /**
     * Update the total duration based on all animations.
     */
    private updateDuration(): void {
        let maxDuration = 0;

        for (const animation of this.animationData) {
            const endTime = animation.startTime + animation.duration;

            if (endTime > maxDuration) {
                maxDuration = endTime;
            }
        }

        this.duration = maxDuration;
    }

    private writeAnimationTiming(animation: AnimationData, delta: number): AnimationTiming {
        const animationEndTime = animation.startTime + animation.duration;
        const hasStarted = this.currentTime >= animation.startTime;
        const isEnded = this.currentTime > animationEndTime;

        this._animationTiming.isActive = hasStarted && !isEnded;
        this._animationTiming.isEnded = isEnded;
        this._animationTiming.isStartFrame = Math.abs(this.currentTime - animation.startTime) < delta;

        return this._animationTiming;
    }

    private updateThreeAnimation(animation: AnimationData, timing: AnimationTiming): void {
        if (!animation.action || !animation.mixer) return;

        if (timing.isActive) {
            if (timing.isStartFrame) {
                animation.action.reset();
                animation.action.play();
            } else if (animation.action.paused) {
                animation.action.paused = false;
                animation.action.play();
            }

            this._mixersToUpdate.add(animation.mixer);
            return;
        }

        if (timing.isEnded) {
            animation.action.paused = true;
        }
    }

    private updateParticleSystemAnimation(animation: AnimationData, timing: AnimationTiming): void {
        const target = animation.target as ParticleEmitter;

        if (timing.isActive) {
            // Particle systems need to be restarted at their start time.
            if (timing.isStartFrame) {
                target.system.restart();
            }

            return;
        }

        if (timing.isEnded) {
            target.system.endEmit();
        }
    }

    private setThreeAnimationTime(animation: AnimationData, time: number): void {
        if (!animation.action || !animation.mixer) return;

        // Reset and update the animation to the correct time.
        animation.action.reset();

        if (this.containsAnimationTime(animation, time)) {
            animation.action.time = time - animation.startTime;
            animation.action.play();
            animation.mixer.update(0);
            animation.action.paused = !this.isPlaying;
        }
    }

    private setParticleSystemAnimationTime(animation: AnimationData, time: number, previousTime: number): void {
        if (!animation.target) return;

        const target = animation.target as ParticleEmitter;

        if (!this.containsAnimationTime(animation, time)) {
            // Outside the time range - stop the particle system.
            target.system.endEmit();
            return;
        }

        if (!this.containsAnimationTime(animation, previousTime)) {
            // Particle systems need a restart when seeking into their time range.
            target.system.restart();
        }
    }

    private containsAnimationTime(animation: AnimationData, time: number): boolean {
        // Seeking treats the exact end time as outside the animation range.
        return time >= animation.startTime && time < animation.startTime + animation.duration;
    }

    private addAnimationFromJSON(json: AnimationJSON, target: Object3D): void {
        switch (json.type) {
            case 'three':
                this.addThreeAnimationFromJSON(json, target);
                return;
            case 'ps':
                this.addParticleSystemAnimation(target as ParticleEmitter, json.startTime, json.duration, json.loop);
                return;
            default:
                json.type satisfies never;
        }
    }

    private addThreeAnimationFromJSON(json: AnimationJSON, target: Object3D): void {
        if (!json.clipUUID) return;

        const matchingClip = target.animations?.find((clip) => clip.uuid === json.clipUUID);
        if (!matchingClip) return;

        this.addThreeAnimation(target, matchingClip, json.startTime, json.duration, json.loop);
    }
}
