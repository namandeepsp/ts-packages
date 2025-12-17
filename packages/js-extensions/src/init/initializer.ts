
// Extension initialization logic
import { ExtensionOptions } from '../types/extension-types';
import { extendString } from '../string';
import { extendArray } from '../array';
import { extendObject } from '../object';
import { extendNumber } from '../number';
import { setPerformanceConfig } from '../core/performance';

export function initExtensions(options: ExtensionOptions = {}): void {
    const {
        string = true,
        array = true,
        object = true,
        number = true,
        performance
    } = options;

    if (performance) {
        // Set performance config if provided
        setPerformanceConfig(performance);
    }

    if (string) extendString();
    if (array) extendArray();
    if (object) extendObject();
    if (number) extendNumber();
}

export function extendAll(): void {
    initExtensions();
}
