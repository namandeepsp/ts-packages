export function defineExtension<T extends object>(
    prototype: T,
    name: string,
    fn: Function,
) {
    if (!Object.prototype.hasOwnProperty.call(prototype, name)) {
        Object.defineProperty(prototype, name, {
            value: fn,
            writable: false,
            configurable: false,
            enumerable: false,
        })
    }
}
