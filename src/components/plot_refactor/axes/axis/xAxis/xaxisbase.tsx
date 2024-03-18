import { Metadata } from '../axis';
import { truncate } from '../../../../../utils/functions/numberProcessing';

export function init(
    drawings: any[],
    left: number,
    right: number,
    deltaMax: number
): Metadata {
    const global = { min: 0, max: 0, scale: 1, translate: 0 };
    // Global
    global.min = Math.min.apply(
        null, drawings.map(drawing => drawing.global.x.min));
    global.max = Math.max.apply(
        null, drawings.map(drawing => drawing.global.x.max));
    global.scale = (right - left) / (global.max - global.min)
    global.translate = left - (right - left) /
        (global.max - global.min) * global.min
    // Local
    const local = { ...global };
    const delta = { min: 0, max: deltaMax, scale: 1, translate: 0 };
    if (global.max > deltaMax) {
        local.min = global.max - deltaMax;
        delta.scale = (right - left) *
            (1 / deltaMax - 1 / (global.max - global.min));
        delta.translate = (right - left) * (
            global.min / (global.max - global.min) -
            local.min / deltaMax)
    }
    return { global, local, delta };
}

export function reScale(
    ds: number,
    left: number,
    right: number,
    deltaMin: number
): Metadata {
    this.metadata.delta.scale = truncate(
        this.metadata.delta.scale + ds,
        (right - left) * (
            1 / this.metadata.delta.max -
            1 / (this.metadata.global.max - this.metadata.global.min)
        ),
        (right - left) * (
            1 / this.metadata.delta.min -
            1 / (this.metadata.global.max - this.metadata.global.min)
        )
    )
    // Scale
    this.metadata.local.min = truncate(
        this.metadata.local.max - 1 / (1 / (
            this.metadata.global.max - this.metadata.global.min
        ) + this.metadata.delta.scale / (right - left)),
        this.metadata.global.min,
        this.metadata.global.max - this.metadata.delta.min
    )
    // Translate
    const dt = left - this.metadata.local.min * this.scale - this.translate
    this.metadata.delta.translate += dt
    const multiplier = (right - left) / (
        right - left + this.metadata.delta.scale *
        (this.metadata.global.max - this.metadata.global.min)
    )
    const offset = multiplier * this.metadata.delta.translate / this.metadata.global.scale
    this.metadata.local.max = truncate(
        multiplier * this.metadata.global.max - offset,
        this.metadata.global.min + this.metadata.delta.min,
        this.metadata.global.max
    )
    this.metadata.local.min = truncate(
        multiplier * this.metadata.global.min - offset,
        this.metadata.global.min,
        this.metadata.global.max - this.metadata.delta.min
    )

}
