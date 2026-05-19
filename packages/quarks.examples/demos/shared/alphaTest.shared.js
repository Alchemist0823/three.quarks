export const alphaTestShared = {
    name: 'AlphaTest',
    duration: 5,
    burstCount: 100,
    life: {min: 4, max: 5},
    speed: 5,
    size: {min: 0.4, max: 0.5},
    angularVelocityAxis: {x: 0, y: 0.5, z: 0.2},
    angularVelocity: 1,
    speedOverLifeCurve: [1, 0.75, 0.5, 0],
    emitterOffsetX: 2,
};
