import { createRequire } from 'node:module'

const requireFn = createRequire('../../package.json')

export const getPackageVersion = (): string => {
	return requireFn('../package.json').version as string
}
