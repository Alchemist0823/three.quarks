import {IPrefab, IAnimationData} from 'quarks.core';
import { Group, Object3D, Clock, AnimationClip, AnimationMixer, AnimationAction, LoopOnce } from 'three';
import { BatchedRenderer } from './BatchedRenderer';
import { ParticleEmitter } from './ParticleEmitter';

/**
 * Interface for animation data
 */
interface AnimationData extends IAnimationData {
    /** Start time in seconds */
    startTime: number;
    /** Duration in seconds */
    duration: number;
    /** Target object */
    target: Object3D;
    /** Type of animation */
    type: 'three' | 'ps';
    /** Animation clip for Three.js animations */
    clip?: AnimationClip;
    /** Mixer for Three.js animations */
    mixer?: AnimationMixer;
    /** Action for Three.js animations */
    action?: AnimationAction;
    /** Loop the animation */
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

/**
 * AnimationPrefab is a class that manages multiple animations in a unified timeline.
 * It can handle both Three.js animations and particle system animations from three.quarks.
 */
export class QuarksPrefab extends Group implements IPrefab {
    type = 'QuarksPrefab';
    public animationData: Array<AnimationData> = [];
    public isPlaying: boolean = false;
    public currentTime: number = -0.00001;
    public timeScale: number = 1;
    public duration: number = 0;

    private _clock: Clock;
    private _mixers: Map<Object3D, AnimationMixer> = new Map();
    private _batchedRenderer?: BatchedRenderer;
    private _tempAnimationJSON: Array<AnimationJSON> = [];
    /**
     * Creates a new AnimationPrefab
     */
    constructor() {
        super();
        this._clock = new Clock(true);
    }

    private registerBatchedRenderer(renderer: BatchedRenderer): void {
        this._batchedRenderer = renderer;
    }

    /**
     * Gets or creates an AnimationMixer for a target object
     * @param target The target object that needs a mixer
     * @returns The AnimationMixer for the target
     */
    private getOrCreateMixer(target: Object3D): AnimationMixer {
        if (!this._mixers.has(target)) {
            const mixer = new AnimationMixer(target);
            this._mixers.set(target, mixer);
        }
        return this._mixers.get(target)!;
    }

    /**
     * Add a Three.js animation
     * @param target The target object to animate
     * @param clip The animation clip
     * @param startTime When to start the animation in seconds
     * @param duration Duration of the animation in seconds
     * @param loop Whether to loop the animation
     * @returns The ID of the added animation
     */
    addThreeAnimation(target: Object3D, clip: AnimationClip, startTime: number = 0, duration: number = clip.duration, loop: boolean = false): AnimationData {
        const mixer = this.getOrCreateMixer(target);
        const action = mixer.clipAction(clip);
        
        if (!loop) {
            action.setLoop(LoopOnce, 1);
            action.clampWhenFinished = true;
        }
        
        const data: AnimationData = {
            startTime,
            duration,
            type: 'three',
            loop,
            target,
            clip,
            mixer,
            action
        };
        this.animationData.push(data);

        this.updateDuration();
        return data;
    }

    /**
     * Add a particle system animation
     * @param emitter The particle emitter
     * @param startTime When to start the animation in seconds
     * @param duration Duration of the animation in seconds
     * @param loop Whether to loop the animation
     * @returns The ID of the added animation
     */
    addParticleSystemAnimation(emitter: ParticleEmitter, startTime: number = 0, duration: number = 0, loop: boolean = false): AnimationData {
        
        // If duration is not specified, use the emitter's system duration
        if (duration <= 0) {
            duration = emitter.system.duration;
        }
        
        const data: AnimationData = {
            startTime,
            duration,
            type: 'ps',
            loop,
            target: emitter
        };
        this.animationData.push(data);

        // Pause the particle system initially
        this.pause();
        
        this.updateDuration();
        return data;
    }

    /**
     * Remove an animation by its index
     * @param index The index of the animation to remove
     */
    removeAnimation(index: number): void {
        this.animationData.splice(index, 1);
        this.updateDuration();
    }

    /**
     * Start playing all animations
     */
    play(): void {
        if (this.isPlaying) return;
        this.isPlaying = true;
    }

    /**
     * Pause all animations
     */
    pause(): void {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        // Pause all particle systems
        this.animationData.forEach(anim => {
            if (anim.target) {
                if (anim.type === 'ps' && !(anim.target as ParticleEmitter).system.paused) {
                    (anim.target as ParticleEmitter).system.pause();
                } else if (anim.type === 'three' && anim.action && anim.action.isRunning()) {
                    anim.action.paused = true;
                }
            }
        });
    }

    /**
     * Stop all animations and reset to the beginning
     */
    stop(): void {
        this.pause();
        this.currentTime = -0.00001;
        
        // Reset all animations
        this.animationData.forEach(anim => {
            if (anim.type === 'ps' && anim.target) {
                (anim.target as ParticleEmitter).system.stop();
            } else if (anim.type === 'three' && anim.mixer && anim.action) {
                anim.action.reset();
            }
        });
    }

    /**
     * Update animations on each frame
     * @param forceDelta Optional delta time to force update
     */
    update(forceDelta?: number): void {
        if (!this.isPlaying) return;
        
        const delta = forceDelta !== undefined ? forceDelta : this._clock.getDelta();
        this.currentTime += delta * this.timeScale;
        
        // Check if animation has ended
        if (this.currentTime > this.duration) {
            // Reset or stop
            this.stop();    
        }
        
        const currentMixers = new Set<AnimationMixer>();
        // Update each animation
        this.animationData.forEach(anim => {
            const { startTime, duration, type, loop, target, action, mixer } = anim;
            
            // Check if this animation should be active
            const animationEndTime = startTime + duration;
            const isTimeToStart = this.currentTime >= startTime;
            const isTimeToEnd = this.currentTime > animationEndTime;
            const isStartFrame = Math.abs(this.currentTime - startTime) < delta;
            
            if (type === 'three' && action && mixer) {
                if (isTimeToStart && !isTimeToEnd) {
                    if (isStartFrame) {
                        action.reset();
                        action.play();
                    } else {
                        // Start or update the animation
                        if (action.paused) {
                            action.paused = false;
                            action.play();
                        }
                    }
                    
                    // Calculate local time for this animation
                    const localTime = this.currentTime - startTime;
                    const normalizedTime = localTime % duration;
                    
                    currentMixers.add(mixer);
                } else if (isTimeToEnd) {
                    action.paused = true;
                }
            } else if (type === 'ps' && target) {
                if (isTimeToStart && !isTimeToEnd) {
                    // Particle systems need to be restarted at their start time
                    if (isStartFrame) {
                        (anim.target as ParticleEmitter).system.restart();
                    }
                } else if (isTimeToEnd) {
                    (anim.target as ParticleEmitter).system.endEmit();
                }
            }
        });

        currentMixers.forEach(mixer => {
            mixer.update(delta);
        });
    }

    /**
     * Set the animation time
     * @param time Time in seconds
     */
    setTime(time: number): void {
        const previousTime = this.currentTime;
        this.currentTime = time;
        
        // Handle updates for each animation
        this.animationData.forEach(anim => {
            const { startTime, duration, type, target, action, mixer } = anim;
            
            if (type === 'three' && action && mixer) {
                // Reset and update the animation to the correct time
                action.reset();
                
                if (time >= startTime && time < startTime + duration) {
                    const localTime = time - startTime;
                    action.time = localTime;
                    action.play();
                    mixer.update(0);
                    action.paused = !this.isPlaying;
                }
            } 
            else if (type === 'ps' && target) {
                // Handle particle system time setting
                if (time >= startTime && time < startTime + duration) {
                    if (previousTime < startTime || previousTime >= startTime + duration) {
                        // Particle system needs to be restarted if we're jumping into its time range
                        (target as ParticleEmitter).system.restart();
                    }
                } else {
                    // Outside the time range - stop the particle system
                    (target as ParticleEmitter).system.endEmit();
                }
            }
        });
    }

    /**
     * Get the total duration of all animations
     */
    getDuration(): number {
        return this.duration;
    }

    /**
     * Update the total duration based on all animations
     */
    private updateDuration(): void {
        let maxDuration = 0;
        
        this.animationData.forEach(anim => {
            const endTime = anim.startTime + anim.duration;
            if (endTime > maxDuration) {
                maxDuration = endTime;
            }
        });
        
        this.duration = maxDuration;
    }

    /**
     * Find objects in the scene by their UUID
     * @param root The root object to search from
     */
    resolveReferences(root: Object3D): void {
        // Find all objects by UUID and update the references
        this._tempAnimationJSON.forEach(animJson => {
            let target: Object3D | undefined;
            
            // Find the target
            root.traverse(object => {
                if (object.uuid === animJson.targetUUID) {
                    target = object;
                }
            });
            
            if (target) {
                // If it's a Three.js animation, find the clip and create the mixer
                if (animJson.type === 'three' && animJson.clipUUID) {
                    // Find the animation clip
                    let clip: AnimationClip | undefined;
                    
                    if (target.animations) {
                        clip = target.animations.find(c => c.uuid === animJson.clipUUID);
                    }

                    if (clip) {
                        this.addThreeAnimation(target, clip, animJson.startTime, animJson.duration, animJson.loop);
                    }
                } else if (animJson.type === 'ps') {
                    this.addParticleSystemAnimation(target as ParticleEmitter, animJson.startTime, animJson.duration, animJson.loop);
                }
            }
        });
            
        this.updateDuration();
        this._tempAnimationJSON = [];
    }

    /**
     * Convert to JSON for serialization
     * @returns JSON object
     */
    toJSON(): any {
        const json = super.toJSON();
        
        // Add animations data
        (json.object as any).animationData = this.animationData.map(anim => ({
            startTime: anim.startTime,
            duration: anim.duration,
            type: anim.type,
            targetUUID: anim.target.uuid,
            clipUUID: anim.clip?.uuid,
            loop: anim.loop
        }));
        
        return json;
    }

    /**
     * Create an AnimationPrefab from JSON data
     * @param json The JSON data
     * @returns A new AnimationPrefab instance
     */
    static fromJSON(json: any): QuarksPrefab {
        const prefab = new QuarksPrefab();
        
        // Add animations
        if (json.animationData) {
            prefab._tempAnimationJSON = json.animationData;
        }
        
        return prefab;
    }
}