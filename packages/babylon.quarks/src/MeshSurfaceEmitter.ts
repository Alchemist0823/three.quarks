import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import {
    Particle,
    EmitterShape,
    ShapeJSON,
    IParticleSystem,
    Vector3,
    Plugin,
} from 'quarks.core';

export class MeshSurfaceEmitter implements EmitterShape {
    type = 'mesh_surface';

    private _triangleIndexToArea: number[] = [];
    private _mesh?: Mesh;
    private _positions?: Float32Array;
    private _indices?: Uint32Array | Int32Array;
    private _meshReferenceId?: string;

    get mesh() {
        return this._mesh;
    }

    set mesh(mesh: Mesh | undefined) {
        this._mesh = mesh;
        if (!mesh) return;

        const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        const indices = mesh.getIndices();
        if (!positions || !indices) return;

        this._positions = new Float32Array(positions);
        this._indices = new Int32Array(indices);

        this._triangleIndexToArea.length = 0;
        let area = 0;
        const triCount = indices.length / 3;
        this._triangleIndexToArea.push(0);

        const a = new Vector3();
        const b = new Vector3();
        const c = new Vector3();

        for (let i = 0; i < triCount; i++) {
            const i0 = indices[i * 3];
            const i1 = indices[i * 3 + 1];
            const i2 = indices[i * 3 + 2];

            a.set(positions[i0 * 3], positions[i0 * 3 + 1], positions[i0 * 3 + 2]);
            b.set(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
            c.set(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);

            b.sub(a);
            c.sub(a);
            const cross = new Vector3();
            cross.crossVectors(b, c);
            area += cross.length() * 0.5;
            this._triangleIndexToArea.push(area);
        }
    }

    constructor(mesh?: Mesh, meshReferenceId?: string) {
        this._meshReferenceId = meshReferenceId;
        if (mesh) this.mesh = mesh;
    }

    initialize(p: Particle) {
        if (!this._positions || !this._indices) {
            p.position.set(0, 0, 0);
            p.velocity.set(0, 0, 1).multiplyScalar(p.startSpeed);
            return;
        }

        const triCount = this._triangleIndexToArea.length - 1;
        let left = 0, right = triCount;
        const target = Math.random() * this._triangleIndexToArea[triCount];

        while (left + 1 < right) {
            const mid = Math.floor((left + right) / 2);
            if (target < this._triangleIndexToArea[mid]) {
                right = mid;
            } else {
                left = mid;
            }
        }

        let u1 = Math.random();
        let u2 = Math.random();
        if (u1 + u2 > 1) {
            u1 = 1 - u1;
            u2 = 1 - u2;
        }

        const idx0 = this._indices[left * 3];
        const idx1 = this._indices[left * 3 + 1];
        const idx2 = this._indices[left * 3 + 2];

        const ax = this._positions[idx0 * 3], ay = this._positions[idx0 * 3 + 1], az = this._positions[idx0 * 3 + 2];
        const bx = this._positions[idx1 * 3] - ax, by = this._positions[idx1 * 3 + 1] - ay, bz = this._positions[idx1 * 3 + 2] - az;
        const cx = this._positions[idx2 * 3] - ax, cy = this._positions[idx2 * 3 + 1] - ay, cz = this._positions[idx2 * 3 + 2] - az;

        p.position.set(ax + bx * u1 + cx * u2, ay + by * u1 + cy * u2, az + bz * u1 + cz * u2);

        const nx = by * cz - bz * cy;
        const ny = bz * cx - bx * cz;
        const nz = bx * cy - by * cx;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        p.velocity.set(nx / len, ny / len, nz / len).multiplyScalar(p.startSpeed);
    }

    toJSON(): ShapeJSON {
        return {type: 'mesh_surface', mesh: this._mesh ? (this._mesh as any).uniqueId?.toString() : this._meshReferenceId ?? ''};
    }

    clone(): EmitterShape {
        return new MeshSurfaceEmitter(this._mesh, this._meshReferenceId);
    }

    update(_system: IParticleSystem, _delta: number): void {}
}

export const MeshSurfaceEmitterPlugin: Plugin = {
    id: 'babylon.quarks',
    initialize: () => {},
    emitterShapes: [{
        type: 'mesh_surface',
        params: [['mesh', ['mesh']]],
        constructor: MeshSurfaceEmitter,
        loadJSON: (json: any) => new MeshSurfaceEmitter(undefined, json?.mesh),
    }],
    behaviors: [],
};
