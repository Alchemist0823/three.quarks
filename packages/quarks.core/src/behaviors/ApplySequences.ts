import {Particle} from '../Particle';
import {Bezier, IntervalValue, ValueGeneratorFromJSON} from '../functions';
import {Vector3} from '../math';
import {Sequencer, SequencerFromJSON} from '../sequencers/Sequencer';
import {Behavior} from './Behavior';

/**
 * Apply sequences to particles.
 * {@link Sequencer}
 */
export class ApplySequences implements Behavior {
    readonly type = 'ApplySequences';

    static BEZIER: Bezier = new Bezier(0, 0, 1, 1);

    sequencers: [IntervalValue, Sequencer][] = [];
    time = 0;
    index = 0;
    pCount = 0;
    delay: number;

    constructor(delayBetweenParticles: number) {
        this.delay = delayBetweenParticles;
    }

    initialize(particle: Particle): void {
        (particle as any).id = this.pCount;
        (particle as any).dst = new Vector3();
        (particle as any).begin = new Vector3();
        (particle as any).inMotion = false;

        this.pCount++;
    }

    reset() {
        this.time = 0;
        this.index = 0;
        this.pCount = 0;
    }

    update(particle: Particle, delta: number): void {
        const sequencer = this.sequencers[this.index];
        const p = particle as any;
        const delay = p.id * this.delay;

        if (this.time >= sequencer[0].a + delay && this.time <= sequencer[0].b + delay) {
            if (!p.inMotion) {
                p.inMotion = true;
                p.begin.copy(particle.position);
                sequencer[1].transform(p.dst, p.id);
            }

            particle.position.lerpVectors(
                p.begin,
                p.dst,
                ApplySequences.BEZIER.genValue((this.time - sequencer[0].a - delay) / (sequencer[0].b - sequencer[0].a))
            );
        } else if (this.time > sequencer[0].b + delay) {
            p.inMotion = false;
        }
    }

    frameUpdate(delta: number): void {
        while (this.index + 1 < this.sequencers.length && this.time >= this.sequencers[this.index + 1][0].a) {
            this.index++;
        }

        this.time += delta;
    }

    appendSequencer(range: IntervalValue, sequencer: Sequencer) {
        this.sequencers.push([range, sequencer]);
    }

    toJSON(): any {
        return {
            type: this.type,
            delay: this.delay,
            sequencers: this.sequencers.map(([range, sequencer]) => ({
                range: range.toJSON(),
                sequencer: sequencer.toJSON(),
            })),
        };
    }

    static fromJSON(json: any): Behavior {
        const seq = new ApplySequences(json.delay);

        for (const sequencerJson of json.sequencers) {
            seq.sequencers.push([
                ValueGeneratorFromJSON(sequencerJson.range) as IntervalValue,
                SequencerFromJSON(sequencerJson.sequencer),
            ]);
        }

        return seq;
    }

    clone(): Behavior {
        const applySequences = new ApplySequences(this.delay);
        applySequences.sequencers = this.sequencers.map((seq) => [seq[0].clone() as IntervalValue, seq[1].clone()]);

        return applySequences;
    }
}
