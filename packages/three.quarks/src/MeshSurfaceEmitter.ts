import {
    EmitterShape,
    IParticleSystem,
    JsonMetaData,
    Particle,
    Plugin,
    Vector3 as QuarksVector3,
    ShapeJSON,
} from 'quarks.core';
import {BufferAttribute, BufferGeometry, Triangle, Vector3} from 'three';

/**
 * A particle emitter that emits particles from the surface of a mesh uniformly.
 */
export class MeshSurfaceEmitter implements EmitterShape {
    readonly type = 'mesh_surface';

    private readonly _cumulativeTriangleAreas: number[] = [];
    private readonly _vA: Vector3 = new Vector3();
    private readonly _vB: Vector3 = new Vector3();
    private readonly _vC: Vector3 = new Vector3();

    private _geometry?: BufferGeometry;

    constructor(geometry?: BufferGeometry) {
        if (!geometry) return;

        this.geometry = geometry;
    }

    get geometry() {
        return this._geometry;
    }

    set geometry(geometry: BufferGeometry | undefined) {
        this._geometry = geometry;
        if (geometry === undefined || typeof geometry === 'string') return;

        this.rebuildCumulativeTriangleAreas(geometry);
    }

    initialize(particle: Particle) {
        const geometry = this._geometry;
        const indexBuffer = geometry?.getIndex();

        if (!geometry || !indexBuffer) {
            particle.position.set(0, 0, 0);
            particle.velocity.set(0, 0, 1).multiplyScalar(particle.startSpeed);

            return;
        }

        this.initializeFromTriangle(particle, geometry, indexBuffer);
    }

    update(system: IParticleSystem, delta: number): void {}

    toJSON(): ShapeJSON {
        return {
            type: 'mesh_surface',
            mesh: this._geometry ? this._geometry.uuid : '',
        };
    }

    static fromJSON(json: any, meta: JsonMetaData): MeshSurfaceEmitter {
        // Serialized shapes may use "geometry", while toJSON currently emits "mesh".
        return new MeshSurfaceEmitter(meta.geometries[json.mesh ?? json.geometry] as BufferGeometry);
    }

    clone(): EmitterShape {
        return new MeshSurfaceEmitter(this._geometry);
    }

    private rebuildCumulativeTriangleAreas(geometry: BufferGeometry) {
        this._cumulativeTriangleAreas.length = 0;

        const indexBuffer = geometry.getIndex()?.array;
        if (!indexBuffer) return;

        this._cumulativeTriangleAreas.push(0);

        const tri = new Triangle();
        const triCount = indexBuffer.length / 3;

        let area = 0;

        for (let i = 0; i < triCount; i++) {
            tri.setFromAttributeAndIndices(
                geometry.getAttribute('position'),
                indexBuffer[i * 3],
                indexBuffer[i * 3 + 1],
                indexBuffer[i * 3 + 2]
            );

            area += tri.getArea();
            this._cumulativeTriangleAreas.push(area);
        }

        geometry.userData.triangleIndexToArea = this._cumulativeTriangleAreas;
    }

    private sampleTriangleIndex() {
        const triangleCount = this._cumulativeTriangleAreas.length - 1;
        const targetArea = Math.random() * this._cumulativeTriangleAreas[triangleCount];

        let left = 0,
            right = triangleCount;

        while (left + 1 < right) {
            const mid = Math.floor((left + right) / 2);

            if (targetArea < this._cumulativeTriangleAreas[mid]) {
                right = mid;
            } else {
                left = mid;
            }
        }

        return left;
    }

    private initializeFromTriangle(particle: Particle, geometry: BufferGeometry, indexBuffer: BufferAttribute) {
        let u1 = Math.random();
        let u2 = Math.random();

        if (u1 + u2 > 1) {
            u1 = 1 - u1;
            u2 = 1 - u2;
        }

        const positionBuffer = geometry.getAttribute('position');
        const triangleIndex = this.sampleTriangleIndex();

        this._vA.fromBufferAttribute(positionBuffer, indexBuffer.array[triangleIndex * 3]);
        this._vB.fromBufferAttribute(positionBuffer, indexBuffer.array[triangleIndex * 3 + 1]);
        this._vC.fromBufferAttribute(positionBuffer, indexBuffer.array[triangleIndex * 3 + 2]);

        this._vB.sub(this._vA);
        this._vC.sub(this._vA);
        this._vA.addScaledVector(this._vB, u1).addScaledVector(this._vC, u2);

        particle.position.copy(this._vA as unknown as QuarksVector3);

        // Velocity based on triangle normal
        this._vA.copy(this._vB).cross(this._vC).normalize();

        particle.velocity
            .copy(this._vA as unknown as QuarksVector3)
            .normalize()
            .multiplyScalar(particle.startSpeed);
    }
}

export const MeshSurfaceEmitterPlugin: Plugin = {
    id: 'three.quarks',
    initialize: () => {},
    emitterShapes: [
        {
            type: 'mesh_surface',
            params: [['geometry', ['geometry']]],
            constructor: MeshSurfaceEmitter,
            loadJSON: MeshSurfaceEmitter.fromJSON,
        },
    ],
    behaviors: [],
};
