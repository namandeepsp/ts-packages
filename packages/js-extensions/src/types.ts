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
    padStart(targetLength: number, padString?: string): string;
    padEnd(targetLength: number, padString?: string): string;
    count(substring: string): number;
    words(): string[];
    lines(): string[];
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
    difference(other: T[]): T[];
    intersection(other: T[]): T[];
    union(other: T[]): T[];
    sample(): T | undefined;
    take(count: number): T[];
    drop(count: number): T[];
  }

  interface Object {
    isEmpty(): boolean;
    pick<T extends Record<string, any>, K extends keyof T>(keys: K[]): Pick<T, K>;
    omit<T extends Record<string, any>, K extends keyof T>(keys: K[]): Omit<T, K>;
    deepClone<T>(): T;
    merge(other: Record<string, any>): Record<string, any>;
    deepFreeze<T>(): T;
    hasPath(path: string): boolean;
    getPath(path: string, defaultValue?: any): any;
    setPath(path: string, value: any): any;
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
    round(decimals?: number): number;
    ceil(decimals?: number): number;
    floor(decimals?: number): number;
    abs(): number;
    sign(): number;
    times(callback: (index: number) => void): void;
  }
}

export { };