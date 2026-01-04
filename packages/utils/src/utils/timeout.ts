/**
 * Timeout utilities for async operations
 * @packageDocumentation
 */

import { TimeoutError } from '../errors/TimeoutError.js'

/**
 * Timeout manager for async operations
 */
export class TimeoutManager {
	/**
	 * Execute a promise with a timeout
	 * @param promise Promise to execute
	 * @param timeoutMs Timeout duration in milliseconds
	 * @param errorMessage Optional custom error message
	 * @returns Promise result or throws TimeoutError
	 * @throws {TimeoutError} If operation times out
	 * @throws Any error thrown by the original promise
	 */
	static async withTimeout<T>(
		promise: Promise<T>,
		timeoutMs: number,
		errorMessage?: string,
	): Promise<T> {
		if (timeoutMs <= 0) {
			throw new RangeError(`Timeout must be positive, got ${timeoutMs}`)
		}

		return new Promise<T>((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(
					new TimeoutError(errorMessage || 'Operation timed out', timeoutMs),
				)
			}, timeoutMs)

			promise
				.then((result) => {
					clearTimeout(timeoutId)
					resolve(result)
				})
				.catch((error) => {
					clearTimeout(timeoutId)
					reject(error)
				})
		})
	}

	/**
	 * Create an AbortSignal that aborts after specified timeout
	 * @param timeoutMs Timeout duration in milliseconds
	 * @returns AbortSignal that aborts after timeout
	 */
	static createTimeoutSignal(timeoutMs: number): AbortSignal {
		if (timeoutMs <= 0) {
			throw new RangeError(`Timeout must be positive, got ${timeoutMs}`)
		}

		const controller = new AbortController()
		setTimeout(() => controller.abort(), timeoutMs)
		return controller.signal
	}

	/**
	 * Create a promise that resolves after specified delay
	 * @param delayMs Delay in milliseconds
	 * @returns Promise that resolves after delay
	 */
	static delay(delayMs: number): Promise<void> {
		if (delayMs < 0) {
			throw new RangeError(`Delay must be non-negative, got ${delayMs}`)
		}

		return new Promise((resolve) => {
			setTimeout(resolve, delayMs)
		})
	}

	/**
	 * Create a promise that rejects after specified timeout
	 * @param timeoutMs Timeout in milliseconds
	 * @param errorMessage Optional error message
	 * @returns Promise that rejects with TimeoutError after timeout
	 */
	static timeoutPromise<T = never>(
		timeoutMs: number,
		errorMessage?: string,
	): Promise<T> {
		return new Promise<T>((_, reject) => {
			setTimeout(() => {
				reject(new TimeoutError(errorMessage || 'Timeout reached', timeoutMs))
			}, timeoutMs)
		})
	}

	/**
	 * Race multiple promises with individual timeouts
	 * @param promises Array of promises to race
	 * @param timeoutMs Timeout for each promise
	 * @returns First promise to resolve, or rejects if all timeout
	 */
	static async raceWithTimeout<T>(
		promises: Promise<T>[],
		timeoutMs: number,
	): Promise<T> {
		const timeoutPromises = promises.map((promise) =>
			this.withTimeout(promise, timeoutMs, 'Race participant timed out'),
		)

		return Promise.race(timeoutPromises)
	}

	/**
	 * Execute function with retry and timeout for each attempt
	 * @param fn Function to execute
	 * @param options Retry and timeout options
	 * @returns Function result
	 */
	static async retryWithTimeout<T>(
		fn: () => Promise<T>,
		options: {
			maxAttempts?: number
			timeoutPerAttempt?: number
			delayBetweenAttempts?: number
			backoffMultiplier?: number
		} = {},
	): Promise<T> {
		const {
			maxAttempts = 3,
			timeoutPerAttempt = 5000,
			delayBetweenAttempts = 1000,
			backoffMultiplier = 2,
		} = options

		if (maxAttempts < 1) {
			throw new RangeError(`maxAttempts must be at least 1, got ${maxAttempts}`)
		}

		let lastError: Error | undefined
		let currentDelay = delayBetweenAttempts

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				return await this.withTimeout(
					fn(),
					timeoutPerAttempt,
					`Attempt ${attempt} timed out`,
				)
			} catch (error) {
				lastError = error as Error

				// Don't delay after last attempt
				if (attempt < maxAttempts) {
					await this.delay(currentDelay)
					currentDelay *= backoffMultiplier
				}
			}
		}

		throw lastError || new Error('All retry attempts failed')
	}
}

/**
 * Create a timeout wrapper for async functions
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Optional error message
 * @returns Function wrapper that adds timeout
 */
export function withTimeout<TArgs extends any[], TReturn>(
	timeoutMs: number,
	errorMessage?: string,
) {
	return (
		target: (...args: TArgs) => Promise<TReturn>,
		_context?: ClassMethodDecoratorContext,
	) => {
		return function (this: any, ...args: TArgs): Promise<TReturn> {
			return TimeoutManager.withTimeout(
				target.apply(this, args),
				timeoutMs,
				errorMessage,
			)
		}
	}
}
