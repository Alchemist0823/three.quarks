import {
    ConstantValue,
    IntervalValue,
    ConstantColor,
    Vector4,
    ValueGenerator,
    FunctionValueGenerator,
    ColorGenerator,
    FunctionColorGenerator,
} from 'three.quarks';
import type { FlexibleValue, FlexibleColor } from './types';

/**
 * Check if a value is a ValueGenerator or FunctionValueGenerator
 */
function isValueGenerator(
    value: unknown
): value is ValueGenerator | FunctionValueGenerator {
    return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        ((value as any).type === 'value' || (value as any).type === 'function') &&
        'genValue' in value
    );
}

/**
 * Check if a value is a ColorGenerator or FunctionColorGenerator
 */
function isColorGenerator(
    value: unknown
): value is ColorGenerator | FunctionColorGenerator {
    return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        ((value as any).type === 'value' || (value as any).type === 'function') &&
        'genColor' in value
    );
}

/**
 * Convert flexible value prop to ValueGenerator or FunctionValueGenerator
 *
 * @param value - number | [min, max] | ValueGenerator | FunctionValueGenerator
 * @returns ValueGenerator | FunctionValueGenerator
 *
 * @example
 * toValueGenerator(5)           // ConstantValue(5)
 * toValueGenerator([1, 10])     // IntervalValue(1, 10)
 * toValueGenerator(myGenerator) // returns as-is
 */
export function toValueGenerator(
    value: FlexibleValue
): ValueGenerator | FunctionValueGenerator {
    if (typeof value === 'number') {
        return new ConstantValue(value);
    }
    if (Array.isArray(value)) {
        return new IntervalValue(value[0], value[1]);
    }
    if (isValueGenerator(value)) {
        return value;
    }
    // Fallback - should not reach here with proper typing
    return new ConstantValue(0);
}

/**
 * Convert flexible color prop to ColorGenerator or FunctionColorGenerator
 *
 * @param value - { r, g, b, a? } | ColorGenerator | FunctionColorGenerator
 * @returns ColorGenerator | FunctionColorGenerator
 *
 * @example
 * toColorGenerator({ r: 1, g: 0, b: 0 })     // ConstantColor(red)
 * toColorGenerator({ r: 1, g: 1, b: 1, a: 0.5 }) // ConstantColor(white, 50% alpha)
 * toColorGenerator(myGradient)               // returns as-is
 */
export function toColorGenerator(
    value: FlexibleColor
): ColorGenerator | FunctionColorGenerator {
    if (isColorGenerator(value)) {
        return value;
    }
    // Plain color object
    if ('r' in value && 'g' in value && 'b' in value) {
        return new ConstantColor(
            new Vector4(value.r, value.g, value.b, value.a ?? 1)
        );
    }
    // Fallback - white
    return new ConstantColor(new Vector4(1, 1, 1, 1));
}

/**
 * Check if a flexible value is defined (not undefined)
 */
export function isDefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}
