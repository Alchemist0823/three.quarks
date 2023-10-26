import {EmitterShape, ShapeJSON} from './EmitterUtil';
import {Particle} from '../Particle';
import {ParticleSystem} from '../ParticleSystem';
import {json} from 'stream/consumers';

export interface GridEmitterParameters {
    width?: number;
    height?: number;
    column?: number;
    row?: number; // [0, Math.PI / 2]
}

export class GridEmitter implements EmitterShape {
    type = 'grid';
    width: number;
    height: number; // [0, Math.PI * 2]
    column: number; // [0, 1]
    row: number; // [0, Math.PI / 2]

    constructor(parameters: GridEmitterParameters = {}) {
        this.width = parameters.width ?? 1;
        this.height = parameters.height ?? 1;
        this.column = parameters.column ?? 10;
        this.row = parameters.row ?? 10;
    }

    initialize(p: Particle) {
        const r = Math.floor(Math.random() * this.row);
        const c = Math.floor(Math.random() * this.column);

        p.position.x = (c * this.width) / this.column - this.width / 2;
        p.position.y = (r * this.height) / this.row - this.height / 2;
        p.position.z = 0;
        p.velocity.set(0, 0, p.startSpeed);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'grid',
            width: this.width,
            height: this.height,
            column: this.column,
            row: this.row,
        };
    }

    static fromJSON(json: any): GridEmitter {
        return new GridEmitter(json);
    }

    clone(): EmitterShape {
        return new GridEmitter({
            width: this.width,
            height: this.height,
            column: this.column,
            row: this.row,
        });
    }

    update(system: ParticleSystem, delta: number): void {}
}
