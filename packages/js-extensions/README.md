# @naman_deep_singh/js-extensions

**Version:** 1.1.0

Universal JavaScript prototype extensions for common development utilities. Works in both Node.js and browser environments with 50+ utility methods.

## Installation

```bash
npm install @naman_deep_singh/js-extensions
# or
pnpm add @naman_deep_singh/js-extensions
```

## Quick Start

```typescript
import { initExtensions } from '@naman_deep_singh/js-extensions';

// Initialize all extensions
initExtensions();

// String utilities
"hello world".toCapitalize(); // "Hello world"
"test@email.com".isEmail(); // true
"hello world".words(); // ["hello", "world"]

// Array utilities
[1, 2, 2, 3].unique(); // [1, 2, 3]
[1, 2, 3, 4, 5].chunk(2); // [[1, 2], [3, 4], [5]]
[1, 2, 3].sample(); // Random element

// Number utilities
(42).toOrdinal(); // "42nd"
(0.75).toPercent(); // "75.00%"
(5).times(i => console.log(i)); // Logs 0,1,2,3,4

// Object utilities
({a: 1, b: 2}).pick(['a']); // {a: 1}
({}).isEmpty(); // true
({user: {name: "John"}}).getPath('user.name'); // "John"
```

## Configuration

### Selective Extensions

```typescript
import { initExtensions, extend } from '@naman_deep_singh/js-extensions';

// Only specific types
initExtensions({ 
  string: true, 
  array: true, 
  object: false, 
  number: false 
});

// Individual extension functions
extend.string(); // Only string methods
extend.array();  // Only array methods
```

### Performance Configuration

```typescript
import { initExtensions, setPerformanceConfig } from '@naman_deep_singh/js-extensions';

// Configure performance options
initExtensions({
  performance: {
    enableCaching: true,    // Cache expensive operations
    maxCacheSize: 200,      // LRU cache size
    enableValidation: false // Skip input validation for speed
  }
});

// Or configure separately
setPerformanceConfig({
  enableCaching: true,
  maxCacheSize: 100
});
```

## String Extensions

### Case Conversion
```typescript
"hello world".toCapitalize();     // "Hello world"
"hello-world".toCamelCase();      // "helloWorld"
"HelloWorld".toKebabCase();       // "hello-world"
"Hello World".toSnakeCase();      // "hello_world"
"hello world".toTitleCase();      // "Hello World"
```

### Validation
```typescript
"test@example.com".isEmail();     // true
"https://example.com".isUrl();    // true
"racecar".isPalindrome();         // true
```

### Text Processing
```typescript
"Long text here".truncate(8);     // "Long tex..."
"Long text here".truncate(8, "!"); // "Long tex!"
"hello world".removeWhitespace(); // "helloworld"
"<p>Hello</p>".stripHtml();       // "Hello"
"hello".reverse();                // "olleh"
```

### Padding & Formatting
```typescript
"5".padStart(3, "0");             // "005"
"5".padEnd(3, "0");               // "500"
"hello world hello".count("hello"); // 2
```

### Text Analysis
```typescript
"hello world test".words();       // ["hello", "world", "test"]
"line1\nline2\nline3".lines();    // ["line1", "line2", "line3"]
```

## Array Extensions

### Basic Operations
```typescript
[1, 2, 2, 3, 1].unique();         // [1, 2, 3]
[1, 2, 3, 4, 5].shuffle();        // [3, 1, 5, 2, 4] (random)
[1, 2, 3, 4, 5].chunk(2);         // [[1, 2], [3, 4], [5]]
[0, 1, false, 2, "", 3].compact(); // [1, 2, 3]
```

### Mathematical Operations
```typescript
[1, 2, 3, 4, 5].sum();            // 15
[1, 2, 3, 4, 5].average();        // 3
```

### Advanced Filtering & Grouping
```typescript
const users = [{name: 'John', age: 25}, {name: 'Jane', age: 30}];
users.groupBy(u => u.age > 25);    // {false: [{name: 'John'...}], true: [{name: 'Jane'...}]}
users.pluck('name');               // ['John', 'Jane']

[1, 2, 3, 4, 5].partition(x => x % 2 === 0); // [[2, 4], [1, 3, 5]]
[1, 2, 3, 4, 5].findLast(x => x > 3);        // 5
```

### Array Manipulation
```typescript
[1, [2, [3, 4]]].flatten(1);      // [1, 2, [3, 4]]
[1, [2, [3, 4]]].deepFlatten();   // [1, 2, 3, 4]
```

### Set Operations
```typescript
[1, 2, 3].difference([2, 3, 4]);  // [1]
[1, 2, 3].intersection([2, 3, 4]); // [2, 3]
[1, 2, 3].union([3, 4, 5]);       // [1, 2, 3, 4, 5]
```

### Sampling & Slicing
```typescript
[1, 2, 3, 4, 5].sample();         // Random element (e.g., 3)
[1, 2, 3, 4, 5].take(3);          // [1, 2, 3]
[1, 2, 3, 4, 5].drop(2);          // [3, 4, 5]
```

## Object Extensions

### Basic Operations
```typescript
({}).isEmpty();                    // true
({a: 1, b: 2}).isEmpty();         // false

const obj = {a: 1, b: 2, c: 3};
obj.pick(['a', 'c']);             // {a: 1, c: 3}
obj.omit(['b']);                  // {a: 1, c: 3}
```

### Deep Operations
```typescript
const original = {a: 1, b: {c: 2}};
const cloned = original.deepClone(); // Complete deep copy
const frozen = original.deepFreeze(); // Recursively frozen

const obj1 = {a: 1, b: 2};
const obj2 = {c: 3, d: 4};
obj1.merge(obj2);                 // {a: 1, b: 2, c: 3, d: 4}
```

### Path Operations
```typescript
const data = {
  user: {
    profile: {
      name: "John",
      age: 30
    }
  }
};

data.hasPath('user.profile.name');     // true
data.hasPath('user.profile.email');    // false
data.getPath('user.profile.name');     // "John"
data.getPath('user.profile.email', 'N/A'); // "N/A"
data.setPath('user.profile.email', 'john@example.com');
// Sets nested property, creates path if needed
```

## Number Extensions

### Formatting
```typescript
(0.75).toPercent();               // "75.00%"
(0.123).toPercent(1);             // "12.3%"
(1234.56).toCurrency();           // "$1,234.56"
(1234.56).toCurrency('EUR', 'de-DE'); // "1.234,56 €"
```

### Ordinal & Roman
```typescript
(1).toOrdinal();                  // "1st"
(42).toOrdinal();                 // "42nd"
(1984).toRoman();                 // "MCMLXXXIV"
(2023).toRoman();                 // "MMXXIII"
```

### Mathematical Operations
```typescript
(15).clamp(10, 20);               // 15
(5).clamp(10, 20);                // 10
(25).clamp(10, 20);               // 20

(15).inRange(10, 20);             // true
(5).inRange(10, 20);              // false
```

### Number Properties
```typescript
(4).isEven();                     // true
(5).isOdd();                      // true
(7).isPrime();                    // true
(5).factorial();                  // 120
```

### Precision & Math
```typescript
(3.14159).round(2);               // 3.14
(3.14159).ceil(2);                // 3.15
(3.14159).floor(2);               // 3.14
(-5).abs();                       // 5
(-5).sign();                      // -1
```

### Iteration
```typescript
(3).times(i => console.log(`Item ${i}`));
// Logs: "Item 0", "Item 1", "Item 2"
```

## Performance Configuration

### Caching System
```typescript
import { setPerformanceConfig, getPerformanceConfig } from '@naman_deep_singh/js-extensions';

// Enable caching for expensive operations
setPerformanceConfig({
  enableCaching: true,
  maxCacheSize: 200,
  enableValidation: true
});

// Check current config
const config = getPerformanceConfig();
console.log(config); // {enableCaching: true, maxCacheSize: 200, enableValidation: true}
```

### Methods with Built-in Caching
The following methods automatically use LRU cache when enabled:
- **`isPrime()`** - Prime number calculations cached for repeated calls
- **`factorial()`** - Factorial results cached to avoid recalculation  
- **`toRoman()`** - Roman numeral conversions cached for reuse
- **`deepClone()`** - Deep clone operations cached for identical objects

### External Caching
```typescript
import { withCache } from '@naman_deep_singh/js-extensions';

// Use caching in your own functions
const expensiveOperation = (input: string) => {
  return withCache(`myOp_${input}`, () => {
    // Your expensive computation here
    return complexCalculation(input);
  });
};
```

### Memory Management
The LRU (Least Recently Used) cache automatically:
- Removes oldest entries when cache is full
- Moves frequently accessed items to front
- Prevents memory leaks in long-running applications

## Browser Usage

```html
<script src="path/to/js-extensions.js"></script>
<script>
  // Extensions are automatically initialized
  console.log("hello".toCapitalize()); // "Hello"
  console.log([1,2,2,3].unique()); // [1, 2, 3]
  console.log((42).toOrdinal()); // "42nd"
  console.log({a: 1, b: 2}.pick(['a'])); // {a: 1}
</script>
```

## TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
// All methods are fully typed
const result: string = "hello".toCapitalize();
const numbers: number[] = [1, 2, 2, 3].unique();
const picked: Pick<{a: number, b: string}, 'a'> = {a: 1, b: "test"}.pick(['a']);

// Performance configuration is also typed
const config: PerformanceConfig = {
  enableCaching: true,
  maxCacheSize: 100,
  enableValidation: false
};
```

## Package Stats

- **60 utility methods** across 4 JavaScript types
- **Zero dependencies** - lightweight and fast
- **Universal compatibility** - Node.js and browser
- **TypeScript native** - complete type definitions
- **Performance optimized** - optional caching system
- **Tree-shakable** - selective imports supported

## Complete API Reference

### Core Functions
```typescript
initExtensions(options?: ExtensionOptions): void
extendAll(): void
setPerformanceConfig(config: Partial<PerformanceConfig>): void
getPerformanceConfig(): PerformanceConfig

// Individual extension functions
extend.string(): void
extend.array(): void
extend.object(): void
extend.number(): void
```

### String Methods (17 methods)
```typescript
toCapitalize(): string
toCamelCase(): string
toKebabCase(): string
toSnakeCase(): string
toTitleCase(): string
truncate(length: number, suffix?: string): string
isEmail(): boolean
isUrl(): boolean
isPalindrome(): boolean
removeWhitespace(): string
stripHtml(): string
reverse(): string
padStart(targetLength: number, padString?: string): string
padEnd(targetLength: number, padString?: string): string
count(substring: string): number
words(): string[]
lines(): string[]
```

### Array Methods (18 methods)
```typescript
unique<T>(): T[]
shuffle<T>(): T[]
chunk<T>(size: number): T[][]
groupBy<T, K>(keyFn: (item: T) => K): Record<K, T[]>
sum(): number
average(): number
compact<T>(): T[]
pluck<T, K>(key: K): T[K][]
findLast<T>(predicate: (item: T) => boolean): T | undefined
partition<T>(predicate: (item: T) => boolean): [T[], T[]]
flatten(depth?: number): any[]
deepFlatten(): any[]
difference<T>(other: T[]): T[]
intersection<T>(other: T[]): T[]
union<T>(other: T[]): T[]
sample<T>(): T | undefined
take<T>(count: number): T[]
drop<T>(count: number): T[]
```

### Object Methods (9 methods)
```typescript
isEmpty(): boolean
pick<T, K>(keys: K[]): Pick<T, K>
omit<T, K>(keys: K[]): Omit<T, K>
deepClone<T>(): T
deepFreeze<T>(): T
merge(other: Record<string, any>): Record<string, any>
hasPath(path: string): boolean
getPath(path: string, defaultValue?: any): any
setPath(path: string, value: any): any
```

### Number Methods (16 methods)
```typescript
toPercent(decimals?: number): string
toCurrency(currency?: string, locale?: string): string
toOrdinal(): string
toRoman(): string
clamp(min: number, max: number): number
inRange(min: number, max: number): boolean
isEven(): boolean
isOdd(): boolean
isPrime(): boolean
factorial(): number
round(decimals?: number): number
ceil(decimals?: number): number
floor(decimals?: number): number
abs(): number
sign(): number
times(callback: (index: number) => void): void
```