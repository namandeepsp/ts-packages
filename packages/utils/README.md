```bash
@naman_deep_singh/utils

**Version: 2.6.1**

Universal JavaScript prototype extensions for common development utilities. Works in both Node.js and browser environments with 70+ utility methods, plus timeout management, connection pooling, and compression utilities.

⚠️ Note: This library extends native prototypes (String, Array, Object, Number). Use consciously in shared or library code.

What's New in v2.6.0
✨ New Utility Modules
Timeout Management: Async operations with timeout support, retry logic, and delays

Connection Pooling: Generic connection pooling with health checks and statistics

Compression Utilities: GZIP, Deflate, and Brotli compression with streaming support

Error Integration: Proper integration with @naman_deep_singh/errors package

Installation
bash
npm install @naman_deep_singh/utils
# or
pnpm add @naman_deep_singh/utils
Quick Start
1. Prototype Extensions
typescript
import { initializeExtensions } from '@naman_deep_singh/utils';

// Initialize all extensions
initializeExtensions();

// String utilities
"hello world".toCapitalize();       // "Hello world"
"hello world".capitalizeWords();    // "Hello World"

// Array utilities  
[1, 2, 2, 3].unique();              // [1, 2, 3]
[1, 2, 3, 4, 5].chunk(2);           // [[1,2],[3,4],[5]]

// Number utilities
(42).toOrdinal();                   // "42nd"
(0.75).toPercent();                 // "75.00%"

// Object utilities
({ a: 1, b: 2 }).pick(['a']);       // { a: 1 }
({}).isEmpty();                     // true
2. Timeout Utilities
typescript
import { TimeoutManager } from '@naman_deep_singh/utils';

// Execute promise with timeout
const result = await TimeoutManager.withTimeout(
  fetchData(),
  5000,
  'Fetch operation timed out'
);

// Create delay
await TimeoutManager.delay(1000);

// Retry with timeout
const data = await TimeoutManager.retryWithTimeout(fetchData, {
  maxAttempts: 3,
  timeoutPerAttempt: 3000,
  backoffMultiplier: 2
});

// Decorator for class methods
class ApiService {
  @withTimeout(5000)
  async fetchUser(id: string) {
    // Method automatically times out after 5s
  }
}
3. Connection Pooling
typescript
import { GenericPool, PoolManager } from '@naman_deep_singh/utils';

// Create a database connection pool
const dbPool = new GenericPool({
  name: 'database',
  minConnections: 2,
  maxConnections: 10,
  createConnection: async () => {
    return await createDatabaseConnection();
  },
  validateConnection: (conn) => conn.isHealthy()
});

// Acquire and use connection
const connection = await dbPool.acquire();
try {
  await connection.query('SELECT * FROM users');
} finally {
  await dbPool.release(connection);
}

// Or use helper method
const users = await dbPool.withConnection(async (conn) => {
  return await conn.query('SELECT * FROM users');
});

// Pool statistics
console.log(dbPool.getStats());
4. Compression Utilities
typescript
import { Compression, CompressionAlgorithm } from '@naman_deep_singh/utils';

// Basic compression
const compressed = await Compression.compress('Hello World', {
  algorithm: CompressionAlgorithm.GZIP,
  level: 6
});

const decompressed = await Compression.decompress(compressed);

// Compression with metrics
const result = await Compression.compressWithMetrics(largeData, {
  algorithm: CompressionAlgorithm.BROTLI,
  level: 9
});
console.log(result.compressionRatio); // 0.45 (55% reduction)

// Streaming compression
await Compression.compressStream(readableStream, writableStream);

// Check supported algorithms
const supported = Compression.getSupportedAlgorithms();
// ['gzip', 'deflate', 'brotli'] (if Node.js 10.16.0+)
5. Error Handling with Custom Errors
typescript
import { 
  TimeoutError, 
  PoolError, 
  CompressionError 
} from '@naman_deep_singh/utils';

try {
  await TimeoutManager.withTimeout(slowOperation(), 1000);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log(`Timeout after ${error.timeoutMs}ms`);
  }
}
Error Handling & Validation
Prototype Methods
All prototype extension methods include strict runtime validation and throw clear native errors.

typescript
"hello".count(123);
// TypeError: count: substring must be a string, got number

[].sum();
// TypeError: sum: array must contain at least one number

(3.14).round(-1);
// TypeError: round: decimals must be a non-negative integer, got -1
Utility Errors
New utilities throw specific error classes from @naman_deep_singh/errors:

typescript
import { 
  TimeoutError,    // Operation timeout (408)
  PoolError,       // Pool exhaustion (503)
  ConnectionError, // Connection failure (502)
  CompressionError // Compression failure (500)
} from '@naman_deep_singh/utils';
Configuration
Selective Extension Loading
typescript
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
typescript
import { setPerformanceConfig } from '@naman_deep_singh/utils';

setPerformanceConfig({
  enableCaching: true,
  maxCacheSize: 200,
});
Notes:

Validation cannot be disabled

Caching is optional (LRU cache)

Pool utilities have built-in health checks

API Reference
Timeout Utilities
typescript
TimeoutManager.withTimeout(promise, timeoutMs, errorMessage?);
TimeoutManager.delay(delayMs);
TimeoutManager.createTimeoutSignal(timeoutMs);
TimeoutManager.retryWithTimeout(fn, options);
TimeoutManager.raceWithTimeout(promises, timeoutMs);
Connection Pooling
typescript
GenericPool<T extends Connection> // Generic connection pool
PoolManager                       // Multi-pool manager
interface PoolConfig              // Pool configuration
interface Connection              // Connection interface
Compression Utilities
typescript
Compression.compress(data, options)
Compression.decompress(data, options)
Compression.compressWithMetrics(data, options)
Compression.createCompressionStream(algorithm, options)
Compression.createDecompressionStream(algorithm)
Compression.isAlgorithmSupported(algorithm)
Compression.getSupportedAlgorithms()
Prototype Extensions (Summary)
String Extensions (21 methods)
typescript
.toCapitalize() .capitalizeWords() .toCamelCase()
.toKebabCase()  .toSnakeCase()     .toTitleCase()
.isEmail()      .isUrl()          .isPalindrome()
.truncate()     .truncateWords()   .removeWhitespace()
.stripHtml()    .reverse()        .reverseWords()
.count()        .slugify()        .words()
.lines()
Array Extensions (23 methods)
typescript
.unique()       .uniqueBy()       .shuffle()
.chunk()        .compact()        .last()
.sortBy()       .sum()           .average()
.groupBy()      .pluck()         .partition()
.difference()   .intersection()   .union()
Number Extensions (19 methods)
typescript
.toPercent()    .toFixedNumber()  .toCurrency()
.clamp()        .inRange()        .isPrime()
.factorial()    .randomUpTo()     .times()
.toOrdinal()    .sign()
Object Extensions (13 methods)
typescript
.isEmpty()      .pick()          .omit()
.mapValues()    .mapKeys()       .filterKeys()
.filterValues() .deepClone()     .deepFreeze()
.hasPath()      .getPath()       .setPath()
Caching Details
Cached Methods (when enabled):
Number.isPrime()

Number.factorial()

Number.toRoman()

Custom Caching:
typescript
import { withCache } from '@naman_deep_singh/utils';
const result = withCache('key', () => expensiveFn());
Pool Health Checks:
Automatic idle connection cleanup

Maximum lifetime enforcement

Periodic health validation

Statistics tracking

TypeScript Support
Full TypeScript support with:

Complete global augmentation

Strict typing for all methods

Zero any leakage in public APIs

Proper type imports/exports

typescript
const x: number[] = [1, 2, 2].unique();
const y: string = "hello".toCapitalize();
const z: CompressionResult = await compressWithMetrics(data);
Package Stats
70+ prototype utility methods

Timeout management utilities

Generic connection pooling

Multi-algorithm compression

Zero production dependencies (except peer deps)

Node.js + Browser compatibility

TypeScript-first design

Optional LRU caching

Strict runtime validation

Dependencies
json
{
  "peerDependencies": {
    "@naman_deep_singh/errors": "^2.3.0"
  }
}
License
ISC © Naman Deep Singh
```