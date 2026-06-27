import { QuarksPrefab } from '../src/';
import { Group, AnimationClip, Object3D, Vector3, KeyframeTrack, MeshBasicMaterial, NumberKeyframeTrack } from 'three';
import { ParticleEmitter, ParticleSystem } from '../src/';

describe('QuarksPrefab', () => {
    let prefab: QuarksPrefab;
    let targetObject: Object3D;
    let animationClip: AnimationClip;
    let particleEmitter: ParticleEmitter;

    beforeEach(() => {
        prefab = new QuarksPrefab();
        targetObject = new Object3D();
        
        // Create a simple animation clip
        const times = [0, 1];
        const values = [0, 0, 0, 1, 1, 1];
        const track = new NumberKeyframeTrack('.position', times, values);
        animationClip = new AnimationClip('test', 1, [track]);
        targetObject.animations = [animationClip];

        // Create a particle emitter
        const system = new ParticleSystem({material: new MeshBasicMaterial({color: 0x00ff00})});
        particleEmitter = system.emitter;

        prefab.add(particleEmitter);
        prefab.add(targetObject);
    });

    describe('constructor', () => {
        it('should create a QuarksPrefab instance', () => {
            expect(prefab).toBeInstanceOf(QuarksPrefab);
            expect(prefab).toBeInstanceOf(Group);
            expect(prefab.type).toBe('QuarksPrefab');
        });

        it('should initialize with default values', () => {
            expect(prefab.animationData).toEqual([]);
            expect(prefab.isPlaying).toBe(false);
            expect(prefab.currentTime).toBeLessThanOrEqual(0);
            expect(prefab.timeScale).toBe(1);
            expect(prefab.duration).toBe(0);
        });
    });

    describe('addThreeAnimation', () => {
        it('should add Three.js animation data', () => {
            const animData = prefab.addThreeAnimation(targetObject, animationClip);
            
            expect(prefab.animationData).toHaveLength(1);
            expect(animData.target).toBe(targetObject);
            expect(animData.clip).toBe(animationClip);
            expect(animData.type).toBe('three');
            expect(animData.duration).toBe(animationClip.duration);
        });

        it('should respect custom start time and duration', () => {
            const startTime = 2;
            const duration = 3;
            const animData = prefab.addThreeAnimation(targetObject, animationClip, startTime, duration);
            
            expect(animData.startTime).toBe(startTime);
            expect(animData.duration).toBe(duration);
        });
    });

    describe('addParticleSystemAnimation', () => {
        it('should add particle system animation data', () => {
            const startTime = 0;
            const duration = 2;
            const animData = prefab.addParticleSystemAnimation(particleEmitter, startTime, duration);
            
            expect(prefab.animationData).toHaveLength(1);
            expect(animData.target).toBe(particleEmitter);
            expect(animData.type).toBe('ps');
            expect(animData.startTime).toBe(startTime);
            expect(animData.duration).toBe(duration);
        });
    });

    describe('serialization', () => {
        it('should serialize to JSON', () => {
            prefab.addThreeAnimation(targetObject, animationClip);
            const json = prefab.toJSON();
            
            expect(json.object.animationData).toBeDefined();
            expect(json.object.animationData).toHaveLength(1);
            expect(json.object.animationData[0].type).toBe('three');
            expect(json.object.animationData[0].targetUUID).toBe(targetObject.uuid);
        });

        it('should deserialize from JSON', () => {
            prefab.addThreeAnimation(targetObject, animationClip);
            prefab.addParticleSystemAnimation(particleEmitter, 0, 2);
            const json = prefab.toJSON();
            
            const newPrefab = QuarksPrefab.fromJSON(json.object);
            expect(newPrefab).toBeInstanceOf(QuarksPrefab);

            newPrefab.resolveReferences(prefab);

            expect(newPrefab.animationData).toHaveLength(2);
            expect(newPrefab.animationData[0].target).toBe(targetObject);
            expect(newPrefab.animationData[0].clip).toBe(animationClip);
            expect(newPrefab.animationData[1].target).toBe(particleEmitter);
        });
    });

    describe('playback control', () => {
        it('should update duration based on animations', () => {
            prefab.addThreeAnimation(targetObject, animationClip, 0, 2);
            prefab.addThreeAnimation(targetObject, animationClip, 1, 2);
            
            expect(prefab.duration).toBe(3); // Latest end time (1 + 2 = 3)
        });

        it('should control playback state', () => {
            prefab.play();
            expect(prefab.isPlaying).toBe(true);

            prefab.pause();
            expect(prefab.isPlaying).toBe(false);

            prefab.stop();
            expect(prefab.isPlaying).toBe(false);
            expect(prefab.currentTime).toBeLessThanOrEqual(0);
        });

        it('should update shared target mixers once per frame', () => {
            const xTrack = new NumberKeyframeTrack('.position[x]', [0, 1], [0, 1]);
            const yTrack = new NumberKeyframeTrack('.position[y]', [0, 1], [0, 1]);
            const xClip = new AnimationClip('x', 1, [xTrack]);
            const yClip = new AnimationClip('y', 1, [yTrack]);

            const animation = prefab.addThreeAnimation(targetObject, xClip, 0, 1);
            prefab.addThreeAnimation(targetObject, yClip, 0, 1);

            const updateSpy = jest.spyOn(animation.mixer!, 'update');

            prefab.play();
            prefab.update(0.5);

            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(0.5);
        });

        it('should treat exact animation end time as outside when seeking', () => {
            const animation = prefab.addThreeAnimation(targetObject, animationClip, 1, 2);
            const playSpy = jest.spyOn(animation.action!, 'play');
            const updateSpy = jest.spyOn(animation.mixer!, 'update');

            prefab.setTime(3);

            expect(playSpy).not.toHaveBeenCalled();
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });
});
