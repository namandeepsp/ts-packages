# @naman_deep_singh/js-extensions

Universal JavaScript prototype extensions for common development utilities. Works in both Node.js and browser environments.

## Installation

```bash
npm install @naman_deep_singh/js-extensions
# or
pnpm add @naman_deep_singh/js-extensions
```

## Usage

### Initialize All Extensions

```typescript
import { initExtensions } from '@naman_deep_singh/js-extensions';

// Initialize all extensions
initExtensions();

// Now use the extensions
"hello world".toCapitalize(); // "Hello world"
[1, 2, 2, 3].unique(); // [1, 2, 3]
```

### Selective Extensions

```typescript
import { extend } from '@naman_deep_singh/js-extensions';

// Only extend strings
extend.string();

// Only extend arrays and objects
initExtensions({ array: true, object: true, string: false, number: false });
```

## String Extensions

- `toCapitalize()` - Capitalize first letter
- `toCamelCase()` - Convert to camelCase
- `toKebabCase()` - Convert to kebab-case
- `toSnakeCase()` - Convert to snake_case
- `truncate(length, suffix?)` - Truncate with optional suffix
- `isEmail()` - Check if valid email
- `isUrl()` - Check if valid URL
- `removeWhitespace()` - Remove all whitespace
- `reverse()` - Reverse string

## Array Extensions

- `unique()` - Remove duplicates
- `shuffle()` - Randomly shuffle array
- `chunk(size)` - Split into chunks
- `groupBy(keyFn)` - Group by key function
- `sum()` - Sum numeric values
- `average()` - Calculate average
- `compact()` - Remove falsy values
- `pluck(key)` - Extract property values

## Object Extensions

- `isEmpty()` - Check if object is empty
- `pick(keys)` - Pick specific keys
- `omit(keys)` - Omit specific keys
- `deepClone()` - Deep clone object
- `merge(other)` - Merge with another object

## Number Extensions

- `toPercent(decimals?)` - Convert to percentage string
- `toCurrency(currency?, locale?)` - Format as currency
- `clamp(min, max)` - Clamp between min/max
- `isEven()` - Check if even
- `isOdd()` - Check if odd
- `isPrime()` - Check if prime number
- `factorial()` - Calculate factorial

## Browser Usage

```html
<script src="path/to/js-extensions.js"></script>
<script>
  // Extensions are automatically initialized
  console.log("hello".toCapitalize()); // "Hello"
</script>
```