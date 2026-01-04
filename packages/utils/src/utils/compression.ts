/**
 * Compression utilities for data compression/decompression
 * @packageDocumentation
 */

import { CompressionError } from '../errors/CompressionError.js'

/**
 * Supported compression algorithms
 */
export enum CompressionAlgorithm {
	/** GZIP compression */
	GZIP = 'gzip',
	/** Deflate compression */
	DEFLATE = 'deflate',
	/** Brotli compression (Node.js 10.16.0+) */
	BROTLI = 'brotli',
}

/**
 * Compression options
 */
export interface CompressionOptions {
	/** Compression algorithm to use */
	algorithm?: CompressionAlgorithm
	/** Compression level (1-9, higher = better compression but slower) */
	level?: number
	/** Encoding for string data */
	encoding?: BufferEncoding
}

/**
 * Compression result with metrics
 */
export interface CompressionResult {
	/** Compressed data */
	data: Buffer | string
	/** Original size in bytes */
	originalSize: number
	/** Compressed size in bytes */
	compressedSize: number
	/** Compression ratio (0-1) */
	compressionRatio: number
	/** Time taken in milliseconds */
	timeTakenMs: number
	/** Algorithm used */
	algorithm: CompressionAlgorithm
}

/**
 * Main compression utility class
 */
export class Compression {
	/**
	 * Default compression options
	 */
	private static readonly DEFAULT_OPTIONS: Required<CompressionOptions> = {
		algorithm: CompressionAlgorithm.GZIP,
		level: 6,
		encoding: 'utf8',
	}

	/**
	 * Check if compression algorithm is supported
	 */
	static isAlgorithmSupported(algorithm: CompressionAlgorithm): boolean {
		switch (algorithm) {
			case CompressionAlgorithm.GZIP:
			case CompressionAlgorithm.DEFLATE:
				return true
			case CompressionAlgorithm.BROTLI:
				// Brotli requires Node.js 10.16.0+
				if (typeof process !== 'undefined' && process.versions?.node) {
					const [major, minor, _patch] = process.versions.node
						.split('.')
						.map(Number)
					// Brotli support from Node.js 10.16.0
					return major > 10 || (major === 10 && minor >= 16)
				}
				return false
			default:
				return false
		}
	}

	/**
	 * Get supported algorithms for current environment
	 */
	static getSupportedAlgorithms(): CompressionAlgorithm[] {
		const algorithms: CompressionAlgorithm[] = [
			CompressionAlgorithm.GZIP,
			CompressionAlgorithm.DEFLATE,
		]

		if (this.isAlgorithmSupported(CompressionAlgorithm.BROTLI)) {
			algorithms.push(CompressionAlgorithm.BROTLI)
		}

		return algorithms
	}

	/**
	 * Compress data
	 * @param input Data to compress (string or Buffer)
	 * @param options Compression options
	 * @returns Compressed data as Buffer
	 */
	static async compress(
		input: string | Buffer,
		options: CompressionOptions = {},
	): Promise<Buffer> {
		const opts = { ...this.DEFAULT_OPTIONS, ...options }

		try {
			this.validateInput(input)
			this.validateOptions(opts)

			const buffer =
				typeof input === 'string' ? Buffer.from(input, opts.encoding) : input

			const compressed = await this.compressBuffer(buffer, opts)
			return compressed
		} catch (error) {
			throw this.wrapError(error, 'compress', opts.algorithm, input)
		}
	}
	/**
	 * Decompress data
	 * @param input Compressed data (Buffer or base64 string)
	 * @param options Compression options
	 * @returns Decompressed data as Buffer
	 */
	static async decompress(
		input: string | Buffer,
		options: CompressionOptions = {},
	): Promise<Buffer> {
		const opts = { ...this.DEFAULT_OPTIONS, ...options }

		try {
			this.validateInput(input)

			const buffer =
				typeof input === 'string' ? Buffer.from(input, 'base64') : input

			const decompressed = await this.decompressBuffer(buffer, opts)
			return decompressed
		} catch (error) {
			throw this.wrapError(error, 'decompress', opts.algorithm, input)
		}
	}

	/**
	 * Compress data with detailed metrics
	 * @param input Data to compress
	 * @param options Compression options
	 * @returns Compression result with metrics
	 */
	static async compressWithMetrics(
		input: string | Buffer,
		options: CompressionOptions = {},
	): Promise<CompressionResult> {
		const startTime = performance.now()
		const opts = { ...this.DEFAULT_OPTIONS, ...options }

		try {
			this.validateInput(input)
			this.validateOptions(opts)

			const buffer =
				typeof input === 'string' ? Buffer.from(input, opts.encoding) : input

			const originalSize = buffer.length
			const compressed = await this.compressBuffer(buffer, opts)
			const endTime = performance.now()
			const compressedSize = compressed.length
			const compressionRatio = compressedSize / originalSize

			return {
				data:
					opts.encoding === 'base64'
						? compressed.toString('base64')
						: compressed,
				originalSize,
				compressedSize,
				compressionRatio,
				timeTakenMs: endTime - startTime,
				algorithm: opts.algorithm,
			}
		} catch (error) {
			throw this.wrapError(error, 'compressWithMetrics', opts.algorithm, input)
		}
	}

	/**
	 * Compress buffer data using specified algorithm
	 */
	private static async compressBuffer(
		buffer: Buffer,
		options: Required<CompressionOptions>,
	): Promise<Buffer> {
		switch (options.algorithm) {
			case CompressionAlgorithm.GZIP:
				return this.compressGzip(buffer, options.level)
			case CompressionAlgorithm.DEFLATE:
				return this.compressDeflate(buffer, options.level)
			case CompressionAlgorithm.BROTLI:
				return this.compressBrotli(buffer, options.level)
			default:
				throw new CompressionError(
					`Unsupported algorithm: ${options.algorithm}`,
					options.algorithm,
				)
		}
	}

	/**
	 * Decompress buffer data using specified algorithm
	 */
	private static async decompressBuffer(
		buffer: Buffer,
		options: Required<CompressionOptions>,
	): Promise<Buffer> {
		switch (options.algorithm) {
			case CompressionAlgorithm.GZIP:
				return this.decompressGzip(buffer)
			case CompressionAlgorithm.DEFLATE:
				return this.decompressDeflate(buffer)
			case CompressionAlgorithm.BROTLI:
				return this.decompressBrotli(buffer)
			default:
				throw new CompressionError(
					`Unsupported algorithm: ${options.algorithm}`,
					options.algorithm,
				)
		}
	}

	/**
	 * GZIP compression
	 */
	private static async compressGzip(
		buffer: Buffer,
		level: number,
	): Promise<Buffer> {
		const { gzip } = await import('zlib')

		return new Promise((resolve, reject) => {
			gzip(buffer, { level }, (error, result) => {
				if (error) reject(error)
				else resolve(result)
			})
		})
	}

	/**
	 * GZIP decompression
	 */
	private static async decompressGzip(buffer: Buffer): Promise<Buffer> {
		const { gunzip } = await import('zlib')

		return new Promise((resolve, reject) => {
			gunzip(buffer, (error, result) => {
				if (error) reject(error)
				else resolve(result)
			})
		})
	}

	/**
	 * Deflate compression
	 */
	private static async compressDeflate(
		buffer: Buffer,
		level: number,
	): Promise<Buffer> {
		const { deflate } = await import('zlib')

		return new Promise((resolve, reject) => {
			deflate(buffer, { level }, (error, result) => {
				if (error) reject(error)
				else resolve(result)
			})
		})
	}

	/**
	 * Deflate decompression
	 */
	private static async decompressDeflate(buffer: Buffer): Promise<Buffer> {
		const { inflate } = await import('zlib')

		return new Promise((resolve, reject) => {
			inflate(buffer, (error, result) => {
				if (error) reject(error)
				else resolve(result)
			})
		})
	}

	/**
	 * Brotli compression (Node.js 10.16.0+)
	 */
	private static async compressBrotli(
		buffer: Buffer,
		level: number,
	): Promise<Buffer> {
		const zlib = await import('zlib')

		if (!zlib.brotliCompress) {
			throw new CompressionError(
				'Brotli compression requires Node.js 10.16.0+',
				CompressionAlgorithm.BROTLI,
				{
					nodeVersion: process?.version || 'unknown',
					requiredVersion: '>=10.16.0',
				},
			)
		}

		return new Promise((resolve, reject) => {
			zlib.brotliCompress(
				buffer,
				{
					params: {
						[zlib.constants.BROTLI_PARAM_QUALITY]: level,
						[zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
					},
				},
				(error, result) => {
					if (error) reject(error)
					else resolve(result)
				},
			)
		})
	}

	/**
	 * Brotli decompression (Node.js 10.16.0+)
	 */
	private static async decompressBrotli(buffer: Buffer): Promise<Buffer> {
		const zlib = await import('zlib')

		if (!zlib.brotliDecompress) {
			throw new CompressionError(
				'Brotli decompression requires Node.js 10.16.0+',
				CompressionAlgorithm.BROTLI,
				{
					nodeVersion: process?.version || 'unknown',
					requiredVersion: '>=10.16.0',
				},
			)
		}

		return new Promise((resolve, reject) => {
			zlib.brotliDecompress(buffer, (error, result) => {
				if (error) reject(error)
				else resolve(result)
			})
		})
	}

	/**
	 * Create compression stream
	 * @param algorithm Compression algorithm
	 * @param options Compression options
	 * @returns Compression stream
	 */
	static createCompressionStream(
		algorithm: CompressionAlgorithm = CompressionAlgorithm.GZIP,
		options: Omit<CompressionOptions, 'algorithm'> = {},
	): NodeJS.ReadWriteStream {
		const opts = { ...this.DEFAULT_OPTIONS, ...options, algorithm }

		this.validateOptions(opts)

		switch (algorithm) {
			case CompressionAlgorithm.GZIP:
				return require('zlib').createGzip({ level: opts.level })
			case CompressionAlgorithm.DEFLATE:
				return require('zlib').createDeflate({ level: opts.level })
			case CompressionAlgorithm.BROTLI:
				const zlib = require('zlib')
				if (!zlib.createBrotliCompress) {
					throw new CompressionError(
						'Brotli stream compression requires Node.js 10.16.0+',
						CompressionAlgorithm.BROTLI,
					)
				}
				return zlib.createBrotliCompress({
					params: {
						[zlib.constants.BROTLI_PARAM_QUALITY]: opts.level,
					},
				})
			default:
				throw new CompressionError(
					`Unsupported algorithm for streaming: ${algorithm}`,
					algorithm,
				)
		}
	}

	/**
	 * Create decompression stream
	 * @param algorithm Compression algorithm
	 * @returns Decompression stream
	 */
	static createDecompressionStream(
		algorithm: CompressionAlgorithm = CompressionAlgorithm.GZIP,
	): NodeJS.ReadWriteStream {
		switch (algorithm) {
			case CompressionAlgorithm.GZIP:
				return require('zlib').createGunzip()
			case CompressionAlgorithm.DEFLATE:
				return require('zlib').createInflate()
			case CompressionAlgorithm.BROTLI:
				const zlib = require('zlib')
				if (!zlib.createBrotliDecompress) {
					throw new CompressionError(
						'Brotli stream decompression requires Node.js 10.16.0+',
						CompressionAlgorithm.BROTLI,
					)
				}
				return zlib.createBrotliDecompress()
			default:
				throw new CompressionError(
					`Unsupported algorithm for streaming: ${algorithm}`,
					algorithm,
				)
		}
	}

	/**
	 * Stream compression
	 * @param readable Readable stream
	 * @param writable Writable stream
	 * @param options Compression options
	 */
	static async compressStream(
		readable: NodeJS.ReadableStream,
		writable: NodeJS.WritableStream,
		options: CompressionOptions = {},
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const compressor = this.createCompressionStream(
				options.algorithm,
				options,
			)

			readable
				.pipe(compressor)
				.pipe(writable)
				.on('finish', resolve)
				.on('error', reject)
		})
	}

	/**
	 * Stream decompression
	 * @param readable Readable stream
	 * @param writable Writable stream
	 * @param options Compression options
	 */
	static async decompressStream(
		readable: NodeJS.ReadableStream,
		writable: NodeJS.WritableStream,
		options: CompressionOptions = {},
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const decompressor = this.createDecompressionStream(options.algorithm)

			readable
				.pipe(decompressor)
				.pipe(writable)
				.on('finish', resolve)
				.on('error', reject)
		})
	}

	/**
	 * Validate input data
	 */
	private static validateInput(input: string | Buffer): void {
		if (input === null || input === undefined) {
			throw new CompressionError('Input cannot be null or undefined')
		}

		if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
			throw new CompressionError(
				`Input must be string or Buffer, got ${typeof input}`,
			)
		}

		if (typeof input === 'string' && input.length === 0) {
			throw new CompressionError('Input string cannot be empty')
		}

		if (Buffer.isBuffer(input) && input.length === 0) {
			throw new CompressionError('Input buffer cannot be empty')
		}
	}

	/**
	 * Validate compression options
	 */
	private static validateOptions(options: Required<CompressionOptions>): void {
		if (!Object.values(CompressionAlgorithm).includes(options.algorithm)) {
			throw new CompressionError(
				`Invalid algorithm: ${options.algorithm}`,
				options.algorithm,
			)
		}

		if (options.level < 1 || options.level > 9) {
			throw new CompressionError(
				`Compression level must be between 1-9, got ${options.level}`,
				options.algorithm,
				{ level: options.level },
			)
		}

		if (!this.isAlgorithmSupported(options.algorithm)) {
			throw new CompressionError(
				`Algorithm not supported: ${options.algorithm}`,
				options.algorithm,
				{
					supportedAlgorithms: this.getSupportedAlgorithms(),
					nodeVersion: process?.version || 'unknown',
				},
			)
		}
	}

	/**
	 * Wrap errors with CompressionError
	 */
	private static wrapError(
		error: unknown,
		operation: string,
		algorithm: CompressionAlgorithm,
		input: string | Buffer,
	): CompressionError {
		if (error instanceof CompressionError) {
			return error
		}

		const errorMessage = error instanceof Error ? error.message : String(error)
		const inputInfo = Buffer.isBuffer(input)
			? { size: input.length, type: 'buffer' }
			: { size: input.length, type: 'string' }

		return new CompressionError(
			`Failed to ${operation} with ${algorithm}: ${errorMessage}`,
			algorithm,
			{
				operation,
				input: inputInfo,
			},
			error instanceof Error ? error : undefined,
		)
	}
}

/**
 * Convenience function for compression
 */
export async function compress(
	input: string | Buffer,
	options: CompressionOptions = {},
): Promise<Buffer> {
	return Compression.compress(input, options)
}

/**
 * Convenience function for decompression
 */
export async function decompress(
	input: string | Buffer,
	options: CompressionOptions = {},
): Promise<Buffer> {
	return Compression.decompress(input, options)
}

/**
 * Convenience function for compression with metrics
 */
export async function compressWithMetrics(
	input: string | Buffer,
	options: CompressionOptions = {},
): Promise<CompressionResult> {
	return Compression.compressWithMetrics(input, options)
}
