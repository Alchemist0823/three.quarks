import * as MathUtils from './MathUtils';
import {Quaternion} from './Quaternion';
import {Euler} from './Euler';
import {Matrix3} from './Matrix3';
import {Matrix4} from './Matrix4';

class Vector3 {
    x: number;
    y: number;
    z: number;
    readonly isVector3 = true;
    constructor(x = 0, y = 0, z = 0) {
        (Vector3.prototype as any).isVector3 = true;

        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x: number, y: number, z: number) {
        if (z === undefined) z = this.z; // sprite.scale.set(x,y)

        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    }

    setScalar(scalar: number) {
        this.x = scalar;
        this.y = scalar;
        this.z = scalar;

        return this;
    }

    setX(x: number) {
        this.x = x;

        return this;
    }

    setY(y: number) {
        this.y = y;

        return this;
    }

    setZ(z: number) {
        this.z = z;

        return this;
    }

    setComponent(index: number, value: number) {
        switch (index) {
            case 0:
                this.x = value;
                break;
            case 1:
                this.y = value;
                break;
            case 2:
                this.z = value;
                break;
            default:
                throw new Error('index is out of range: ' + index);
        }

        return this;
    }

    getComponent(index: number) {
        switch (index) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            default:
                throw new Error('index is out of range: ' + index);
        }
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v: Vector3) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;
    }

    add(v: Vector3) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;
    }

    addScalar(s: number) {
        this.x += s;
        this.y += s;
        this.z += s;

        return this;
    }

    addVectors(a: Vector3, b: Vector3) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;

        return this;
    }

    addScaledVector(v: Vector3, s: number) {
        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;

        return this;
    }

    sub(v: Vector3) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;
    }

    subScalar(s: number) {
        this.x -= s;
        this.y -= s;
        this.z -= s;

        return this;
    }

    subVectors(a: Vector3, b: Vector3) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;

        return this;
    }

    multiply(v: Vector3) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;

        return this;
    }

    multiplyScalar(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;
    }

    multiplyVectors(a: Vector3, b: Vector3) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;

        return this;
    }

    applyEuler(euler: Euler) {
        return this.applyQuaternion(_quaternion.setFromEuler(euler));
    }

    applyAxisAngle(axis: Vector3, angle: number) {
        return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));
    }

    applyMatrix3(m: Matrix3) {
        const x = this.x,
            y = this.y,
            z = this.z;
        const e = m.elements;

        this.x = e[0] * x + e[3] * y + e[6] * z;
        this.y = e[1] * x + e[4] * y + e[7] * z;
        this.z = e[2] * x + e[5] * y + e[8] * z;

        return this;
    }

    applyNormalMatrix(m: Matrix3) {
        return this.applyMatrix3(m).normalize();
    }

    applyMatrix4(m: Matrix4) {
        const x = this.x,
            y = this.y,
            z = this.z;
        const e = m.elements;

        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

        return this;
    }

    applyQuaternion(q: Quaternion) {
        // quaternion q is assumed to have unit length

        const vx = this.x,
            vy = this.y,
            vz = this.z;
        const qx = q.x,
            qy = q.y,
            qz = q.z,
            qw = q.w;

        // t = 2 * cross( q.xyz, v );
        const tx = 2 * (qy * vz - qz * vy);
        const ty = 2 * (qz * vx - qx * vz);
        const tz = 2 * (qx * vy - qy * vx);

        // v + q.w * t + cross( q.xyz, t );
        this.x = vx + qw * tx + qy * tz - qz * ty;
        this.y = vy + qw * ty + qz * tx - qx * tz;
        this.z = vz + qw * tz + qx * ty - qy * tx;

        return this;
    }

    /*project(camera: Camera) {
        return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
    }

    unproject(camera: Camera) {
        return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
    }*/

    transformDirection(m: Matrix4) {
        // input: ../math.Matrix4 affine matrix
        // vector interpreted as a direction

        const x = this.x,
            y = this.y,
            z = this.z;
        const e = m.elements;

        this.x = e[0] * x + e[4] * y + e[8] * z;
        this.y = e[1] * x + e[5] * y + e[9] * z;
        this.z = e[2] * x + e[6] * y + e[10] * z;

        return this.normalize();
    }

    divide(v: Vector3) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;

        return this;
    }

    divideScalar(scalar: number) {
        return this.multiplyScalar(1 / scalar);
    }

    min(v: Vector3) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);

        return this;
    }

    max(v: Vector3) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);

        return this;
    }

    clamp(min: Vector3, max: Vector3) {
        // assumes min < max, componentwise

        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        this.z = Math.max(min.z, Math.min(max.z, this.z));

        return this;
    }

    clampScalar(minVal: number, maxVal: number) {
        this.x = Math.max(minVal, Math.min(maxVal, this.x));
        this.y = Math.max(minVal, Math.min(maxVal, this.y));
        this.z = Math.max(minVal, Math.min(maxVal, this.z));

        return this;
    }

    clampLength(min: number, max: number) {
        const length = this.length();

        return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);

        return this;
    }

    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);

        return this;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);

        return this;
    }

    roundToZero() {
        this.x = Math.trunc(this.x);
        this.y = Math.trunc(this.y);
        this.z = Math.trunc(this.z);

        return this;
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;

        return this;
    }

    dot(v: Vector3) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    // TODO lengthSquared?

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }

    normalize() {
        return this.divideScalar(this.length() || 1);
    }

    setLength(length: number) {
        return this.normalize().multiplyScalar(length);
    }

    lerp(v: Vector3, alpha: number) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;

        return this;
    }

    lerpVectors(v1: Vector3, v2: Vector3, alpha: number) {
        this.x = v1.x + (v2.x - v1.x) * alpha;
        this.y = v1.y + (v2.y - v1.y) * alpha;
        this.z = v1.z + (v2.z - v1.z) * alpha;

        return this;
    }

    cross(v: Vector3) {
        return this.crossVectors(this, v);
    }

    crossVectors(a: Vector3, b: Vector3) {
        const ax = a.x,
            ay = a.y,
            az = a.z;
        const bx = b.x,
            by = b.y,
            bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    }

    projectOnVector(v: Vector3) {
        const denominator = v.lengthSq();

        if (denominator === 0) return this.set(0, 0, 0);

        const scalar = v.dot(this) / denominator;

        return this.copy(v).multiplyScalar(scalar);
    }

    projectOnPlane(planeNormal: Vector3) {
        _vector.copy(this).projectOnVector(planeNormal);

        return this.sub(_vector);
    }

    reflect(normal: Vector3) {
        // reflect incident vector off plane orthogonal to normal
        // normal is assumed to have unit length

        return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
    }

    angleTo(v: Vector3) {
        const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

        if (denominator === 0) return Math.PI / 2;

        const theta = this.dot(v) / denominator;

        // clamp, to handle numerical problems

        return Math.acos(MathUtils.clamp(theta, -1, 1));
    }

    distanceTo(v: Vector3) {
        return Math.sqrt(this.distanceToSquared(v));
    }

    distanceToSquared(v: Vector3) {
        const dx = this.x - v.x,
            dy = this.y - v.y,
            dz = this.z - v.z;

        return dx * dx + dy * dy + dz * dz;
    }

    manhattanDistanceTo(v: Vector3) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }

    /*setFromSpherical(s) {
        return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
    }*/

    setFromSphericalCoords(radius: number, phi: number, theta: number) {
        const sinPhiRadius = Math.sin(phi) * radius;

        this.x = sinPhiRadius * Math.sin(theta);
        this.y = Math.cos(phi) * radius;
        this.z = sinPhiRadius * Math.cos(theta);

        return this;
    }

    /*setFromCylindrical(c) {
        return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
    }*/

    setFromCylindricalCoords(radius: number, theta: number, y: number) {
        this.x = radius * Math.sin(theta);
        this.y = y;
        this.z = radius * Math.cos(theta);

        return this;
    }

    setFromMatrixPosition(m: Matrix4) {
        const e = m.elements;

        this.x = e[12];
        this.y = e[13];
        this.z = e[14];

        return this;
    }

    setFromMatrixScale(m: Matrix4) {
        const sx = this.setFromMatrixColumn(m, 0).length();
        const sy = this.setFromMatrixColumn(m, 1).length();
        const sz = this.setFromMatrixColumn(m, 2).length();

        this.x = sx;
        this.y = sy;
        this.z = sz;

        return this;
    }

    setFromMatrixColumn(m: Matrix4, index: number) {
        return this.fromArray(m.elements, index * 4);
    }

    setFromMatrix3Column(m: Matrix3, index: number) {
        return this.fromArray(m.elements, index * 3);
    }

    setFromEuler(e: Euler) {
        this.x = e._x;
        this.y = e._y;
        this.z = e._z;

        return this;
    }

    /*setFromColor(c) {
        this.x = c.r;
        this.y = c.g;
        this.z = c.b;

        return this;
    }*/

    equals(v: Vector3) {
        return v.x === this.x && v.y === this.y && v.z === this.z;
    }

    fromArray(array: number[], offset = 0) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];

        return this;
    }

    toArray(array: number[] = [], offset = 0) {
        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;

        return array;
    }

    /*fromBufferAttribute(attribute, index) {
        this.x = attribute.getX(index);
        this.y = attribute.getY(index);
        this.z = attribute.getZ(index);

        return this;
    }*/

    random() {
        this.x = Math.random();
        this.y = Math.random();
        this.z = Math.random();

        return this;
    }

    randomDirection() {
        // https://mathworld.wolfram.com/SpherePointPicking.html

        const theta = Math.random() * Math.PI * 2;
        const u = Math.random() * 2 - 1;
        const c = Math.sqrt(1 - u * u);

        this.x = c * Math.cos(theta);
        this.y = u;
        this.z = c * Math.sin(theta);

        return this;
    }

    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
        yield this.z;
    }
}

const _vector = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

export {Vector3};
