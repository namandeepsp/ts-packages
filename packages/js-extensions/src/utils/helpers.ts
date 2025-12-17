// Shared helper functions for extensions

export function isValidArrayIndex(index: number): boolean {
    return Number.isInteger(index) && index >= 0;
}

export function ensurePositiveInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value < 0) {
        throw new TypeError(`${name} must be a positive integer`);
    }
}

export function safeClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;

    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (Array.isArray(obj)) return obj.map(item => safeClone(item)) as unknown as T;

    const cloned = {} as Record<string, unknown>;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = safeClone((obj as Record<string, unknown>)[key]);
        }
    }
    return cloned as T;
}

export function getPathSegments(path: string): string[] {
    return path.split('.').filter(segment => segment.length > 0);
}

export function hasOwnProperty(obj: any, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
