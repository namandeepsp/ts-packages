// TypeScript declarations for all extensions
declare global {
  interface String {
    toCapitalize(): string;
    toCamelCase(): string;
    toKebabCase(): string;
    toSnakeCase(): string;
    truncate(length: number, suffix?: string): string;
    isEmail(): boolean;
    isUrl(): boolean;
    removeWhitespace(): string;
    reverse(): string;
    isPalindrome(): boolean;
    toTitleCase(): string;
    stripHtml(): string;
  }

  interface Array<T> {
    unique(): T[];
    shuffle(): T[];
    chunk(size: number): T[][];
    groupBy<K extends string | number>(keyFn: (item: T) => K): Record<K, T[]>;
    sum(): number;
    average(): number;
    compact(): T[];
    pluck<K extends keyof T>(key: K): T[K][];
    findLast(predicate: (item: T) => boolean): T | undefined;
    partition(predicate: (item: T) => boolean): [T[], T[]];
    flatten(depth?: number): any[];
    deepFlatten(): any[];
  }

  interface Object {
    isEmpty(): boolean;
    pick<T extends Record<string, any>, K extends keyof T>(keys: K[]): Pick<T, K>;
    omit<T extends Record<string, any>, K extends keyof T>(keys: K[]): Omit<T, K>;
    deepClone<T>(): T;
    merge(other: Record<string, any>): Record<string, any>;
    deepFreeze<T>(): T;
  }

  interface Number {
    toPercent(decimals?: number): string;
    toCurrency(currency?: string, locale?: string): string;
    clamp(min: number, max: number): number;
    isEven(): boolean;
    isOdd(): boolean;
    isPrime(): boolean;
    factorial(): number;
    toOrdinal(): string;
    toRoman(): string;
    inRange(min: number, max: number): boolean;
  }
}

export {};