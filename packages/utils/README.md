@naman_deep_singh/utils

Version: 2.4.0

Universal JavaScript prototype extensions for common development utilities. Works in both Node.js and browser environments with 70+ utility methods.

⚠️ This library extends native prototypes (String, Array, Object, Number). Use consciously in shared or library code.

---

## Installation
```bash
npm install @naman_deep_singh/utils
# or
pnpm add @naman_deep_singh/utils
Quick Start
import { initializeExtensions } from '@naman_deep_singh/utils';

// Initialize all extensions
initializeExtensions();

// String utilities
"hello world".toCapitalize();       // "Hello world"
"hello world".capitalizeWords();    // "Hello World"
"hello world".reverseWords();       // "world hello"
"test@email.com".isEmail();         // true
"hello world".words();              // ["hello", "world"]

// Array utilities
[1, 2, 2, 3].unique();              // [1, 2, 3]
[1, 2, 3, 4, 5].chunk(2);           // [[1,2],[3,4],[5]]
[1, 2, 3].sample();                 // random element
[1,2,3,4].last();                   // 4
[{id:1},{id:2},{id:1}].uniqueBy(x => x.id); // [{id:1},{id:2}]
[3,1,2].sortBy(x => x);             // [1,2,3]

// Number utilities
(42).toOrdinal();                    // "42nd"
(0.75).toPercent();                  // "75.00%"
(3.14159).toFixedNumber(2);          // 3.14
(5).randomUpTo();                    // 0..5 random number
(5).times(i => console.log(i));      // 0..4

// Object utilities
({ a: 1, b: 2 }).pick(['a']);        // { a: 1 }
({ a: 1, b: 2 }).mapValues(v => v * 2); // { a: 2, b: 4 }
({ a: 1, b: 2 }).mapKeys(k => k + "_"); // { a_: 1, b_: 2 }
({}).isEmpty();                       // true
({ user: { name: "John" } }).getPath('user.name'); // "John"
({ a: 1, b: 2 }).filterKeys(k => k === 'a'); // { a: 1 }
({ a: 1, b: 2 }).filterValues(v => v === 1); // { a: 1 }
Error Handling & Validation
All methods include strict runtime validation and throw clear native errors.

"hello".count(123);
// TypeError: count: substring must be a string, got number

"hello".count("");
// TypeError: count: substring cannot be empty

[].sum();
// TypeError: sum: array must contain at least one number

({ a: 1 }).pick(null as any);
// TypeError: pick: keys must be an array, got object

(3.14).round(-1);
// TypeError: round: decimals must be a non-negative integer, got -1
Error Types Used

TypeError – invalid type or missing argument

RangeError – out-of-range numeric values (e.g. toRoman)

✅ No custom error classes are exposed — only standard JS errors.

Configuration
Selective Extension Loading
import { initializeExtensions, extend } from '@naman_deep_singh/utils';

// Enable only specific prototypes
initializeExtensions({
  string: true,
  array: true,
  object: false,
  number: false,
});

// Or initialize individually
extend.string();
extend.array();
Performance Configuration
Caching System
import { setPerformanceConfig } from '@naman_deep_singh/utils';

setPerformanceConfig({
  enableCaching: true,
  maxCacheSize: 200,
});
Notes:

Validation cannot be disabled

Caching is optional

Uses a simple LRU cache

String Extensions (21 methods)
Case Conversion

"hello world".toCapitalize();    // "Hello world"
"hello world".capitalizeWords(); // "Hello World"
"hello-world".toCamelCase();     // "helloWorld"
"HelloWorld".toKebabCase();      // "hello-world"
"Hello World".toSnakeCase();     // "hello_world"
"hello world".toTitleCase();     // "Hello World"
Validation & Checks

"test@example.com".isEmail();   // true
"https://example.com".isUrl();  // true
"racecar".isPalindrome();       // true
Text Utilities

"Long text here".truncate(8);        // "Long tex..."
"hello world".truncateWords(1);      // "hello..."
"hello world".removeWhitespace();    // "helloworld"
"<p>Hello</p>".stripHtml();          // "Hello"
"hello".reverse();                   // "olleh"
"hello world".reverseWords();        // "world hello"
"hello hello".count("hello");        // 2
"Hello World".slugify();             // "hello-world"
"hello world".words();               // ["hello", "world"]
"hello\nworld".lines();              // ["hello","world"]
Array Extensions (23 methods)
Core Utilities

[1, 2, 2, 3].unique();                  // [1,2,3]
[{id:1},{id:2},{id:1}].uniqueBy(x => x.id); // [{id:1},{id:2}]
[1,2,3,4,5].shuffle();                  // random order
[1,2,3,4,5].chunk(2);                   // [[1,2],[3,4],[5]]
[0,1,false,2,"",3].compact();           // [1,2,3] removes null, undefined, false, and empty strings
[1,2,3,4].last();                        // 4
[3,1,2].sortBy(x => x);                  // [1,2,3]
Math

[1,2,3].sum();       // 6
[1,2,3].average();   // 2
Advanced

users.groupBy(u => u.age);
users.pluck('name');
[1,2,3,4].partition(n => n % 2 === 0);
// [[2,4],[1,3]]
Set Operations

[1,2,3].difference([2]);     // [1,3]
[1,2,3].intersection([2,3]); // [2,3]
[1,2,3].union([3,4]);        // [1,2,3,4]
Object Extensions (13 methods)
({}).isEmpty(); // true
({ a: 1, b: 2 }).pick(['a']);      // { a: 1 }
({ a: 1, b: 2 }).omit(['b']);      // { a: 1 }
({ a: 1, b: 2 }).mapValues(v => v*2); // { a: 2, b: 4 }
({ a: 1, b: 2 }).mapKeys(k => k+"_");  // { a_:1, b_:2 }
({ a: 1, b: 2 }).filterKeys(k => k==='a'); // { a:1 }
({ a: 1, b: 2 }).filterValues(v => v===1); // { a:1 }
({ a: { b: 2 } }).deepClone();
({ a: { b: 2 } }).deepFreeze();
data.hasPath('user.profile.name');
data.getPath('user.profile.email', 'N/A');
data.setPath('user.profile.email', 'john@example.com');
Number Extensions (19 methods)
(0.75).toPercent();                 // "75.00%"
(3.14159).toFixedNumber(2);         // 3.14
(1234.56).toCurrency();             // "$1,234.56"
(1234.56).toCurrency('EUR','de-DE'); // "1.234,56 €"
(5).clamp(1,10);                     // 5
(5).inRange(1,10);                   // true
(7).isPrime();                        // true
(5).factorial();                      // 120
(5).randomUpTo();                     // 0..5
(3).times(i => console.log(i));      // 0,1,2
(42).toOrdinal();                     // "42nd"
(123).sign();                         // 1
Caching Details
Cached Methods (when enabled):

Number.isPrime()

Number.factorial()

Number.toRoman()

Custom Caching:

import { withCache } from '@naman_deep_singh/utils';
const result = withCache('key', () => expensiveFn());
TypeScript Support
Full global augmentation

Strict typing for all methods

Zero any leakage in public APIs

const x: number[] = [1,2,2].unique();
const y: string = "hello".toCapitalize();
Package Stats
~70 utility methods

Zero dependencies

Node.js + Browser

TypeScript-first

Optional LRU caching

Strict runtime validation