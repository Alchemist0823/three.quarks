import { BufferGeometry, Material, Texture } from "three";

export type ThreeMetaData = {
    textures: {[uuid: string]: Texture};
    materials: {[uuid: string]: Material};
    geometries: {[uuid: string]: BufferGeometry};
};

export function getMaterialUVChannelName(value: number): string {
    if (value === 0) return 'uv';
    return `uv${value}`;
}
