export function getMaterialUVChannelName(value: number): string {
    if (value === 0) return 'uv';
    return `uv${value}`;
}
