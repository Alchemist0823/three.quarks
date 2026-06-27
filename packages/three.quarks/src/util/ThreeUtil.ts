import {BufferAttribute, BufferGeometry, Material, Texture} from 'three';

export type ThreeMetaData = {
    textures: {[uuid: string]: Texture};
    materials: {[uuid: string]: Material};
    geometries: {[uuid: string]: BufferGeometry};
};

export function getMaterialUVChannelName(value: number): string {
    if (value === 0) return 'uv';
    return `uv${value}`;
}

/**
 * Marks a buffer attribute range for upload.
 * @param buffer - The buffer attribute to update.
 * @param updateRangeStart - The update range start offset in attribute components.
 * @param updateRangeCount - The number of attribute components to update.
 * @returns The same buffer attribute.
 */
export function updateBufferAttribute<TBuffer extends BufferAttribute>(
    buffer: TBuffer,
    updateRangeStart: number,
    updateRangeCount: number
): TBuffer {
    buffer.clearUpdateRanges();
    buffer.addUpdateRange(updateRangeStart, updateRangeCount);
    buffer.needsUpdate = true;

    return buffer;
}
