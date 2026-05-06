import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Scene} from '@babylonjs/core/scene';
import {Matrix4, IParticleSystem} from 'quarks.core';

export class ParticleEmitter extends TransformNode {
    system: IParticleSystem;
    private _matrixWorld: Matrix4 = new Matrix4();

    get matrixWorld(): Matrix4 {
        const m = this.getWorldMatrix();
        const e = this._matrixWorld.elements;
        e[0] = m.m[0]; e[1] = m.m[1]; e[2] = m.m[2]; e[3] = m.m[3];
        e[4] = m.m[4]; e[5] = m.m[5]; e[6] = m.m[6]; e[7] = m.m[7];
        e[8] = m.m[8]; e[9] = m.m[9]; e[10] = m.m[10]; e[11] = m.m[11];
        e[12] = m.m[12]; e[13] = m.m[13]; e[14] = m.m[14]; e[15] = m.m[15];
        return this._matrixWorld;
    }

    get visible(): boolean {
        return this.isEnabled();
    }

    set visible(value: boolean) {
        this.setEnabled(value);
    }

    get uuid(): string {
        return this.uniqueId.toString();
    }

    constructor(system: IParticleSystem, scene?: Scene) {
        super('particleEmitter', scene || undefined);
        this.system = system;
    }

    dispose(): void {
        super.dispose();
    }

    clone(name?: string): ParticleEmitter {
        const clonedEmitter = new ParticleEmitter(this.system, this.getScene());
        clonedEmitter.position = this.position.clone();
        clonedEmitter.rotation = this.rotation.clone();
        clonedEmitter.scaling = this.scaling.clone();
        return clonedEmitter;
    }
}
