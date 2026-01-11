#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const fullPkgName = process.argv[2]

if (!fullPkgName) {
    console.error('❌ Please provide a package name')
    console.error('👉 Example: node create-ts-package.mjs @naman_deep_singh/utils')
    process.exit(1)
}

/**
 * @scope/pkg -> pkg
 * pkg -> pkg
 */
let pkgFolder = fullPkgName.includes('/')
    ? fullPkgName.split('/').pop()
    : fullPkgName

if (pkgFolder.includes('-')) {
    pkgFolder = pkgFolder.split('-').pop()
}

const rootDir = path.join(process.cwd(), pkgFolder)
const srcDir = path.join(rootDir, 'src')

/* -----------------------------
 * package.json
 * ---------------------------- */
const packageJson = {
    name: fullPkgName,
    version: '1.0.0',
    description: `${fullPkgName} package`,
    type: 'module',
    main: './dist/cjs/index.js',
    module: './dist/esm/index.js',
    types: './dist/types/index.d.ts',
    exports: {
        '.': {
            "import": "./dist/esm/index.js",
            "require": "./dist/cjs/index.js",
            "types": "./dist/types/index.d.ts"
        }
    },
    sideEffects: false,
    files: ['dist', 'README.md'],
    scripts: {
        build: 'pnpm run build:types && tsc -p tsconfig.cjs.json && tsc -p tsconfig.esm.json',
        'build:types': 'tsc -p tsconfig.types.json',
        clean: 'rimraf dist',
        "prepublishOnly": "pnpm run clean && pnpm run build",
        'clean:js': 'find src -type f -name "*.js" -delete',
    },
    keywords: [],
    author: 'Naman Deep Singh',
    license: 'ISC',
    packageManager: 'pnpm@10.20.0',
    devDependencies: {
        rimraf: '^5.0.5',
        typescript: '^5.9.3',
    },
    dependencies: {
        '@types/node': '^25.0.1',
    },
    publishConfig: {
        access: 'public',
    },
}

/* -----------------------------
 * README.md
 * ---------------------------- */
const readme = `# ${fullPkgName}

> Generated TypeScript package

## Installation

\`\`\`sh
npm install ${fullPkgName}
\`\`\`

## Usage

\`\`\`ts
import '${fullPkgName}'
\`\`\`
`

/* -----------------------------
 * src/index.ts
 * ---------------------------- */
const indexTs = `console.log('📦 ${fullPkgName} loaded')\n`

/* -----------------------------
 * TS Configs
 * ---------------------------- */
const tsConfigs = {
    'tsconfig.types.json': {
        compilerOptions: {
            target: 'ES2020',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: false,
            declaration: true,
            emitDeclarationOnly: true,
            outDir: 'dist/types',
        },
        include: ['src'],
    },

    'tsconfig.cjs.json': {
        compilerOptions: {
            target: 'ES2020',
            module: 'CommonJS',
            moduleResolution: 'Node',
            strict: true,
            esModuleInterop: true,
            outDir: 'dist/cjs',
        },
        include: ['src'],
    },

    'tsconfig.esm.json': {
        compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            strict: true,
            outDir: 'dist/esm',
        },
        include: ['src'],
    },

    'tsconfig.json': {
        compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
        },
        include: ['src'],
        exclude: ['dist', 'node_modules'],
    },
}

/* -----------------------------
 * Create folders
 * ---------------------------- */
if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true })
    console.log(`📁 Created ${pkgFolder}/`)
}

if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true })
    console.log('📁 Created src/')
}

/* -----------------------------
 * Write base files
 * ---------------------------- */
const baseFiles = [
    { name: 'package.json', content: JSON.stringify(packageJson, null, 2) },
    { name: 'README.md', content: readme },
    { name: 'src/index.ts', content: indexTs },
]

for (const file of baseFiles) {
    const filePath = path.join(rootDir, file.name)

    if (fs.existsSync(filePath)) {
        console.log(`⏭️  ${pkgFolder}/${file.name} already exists, skipping`)
        continue
    }

    fs.writeFileSync(filePath, file.content, 'utf8')
    console.log(`✅ Created ${pkgFolder}/${file.name}`)
}

/* -----------------------------
 * Write TS configs
 * ---------------------------- */
for (const [file, config] of Object.entries(tsConfigs)) {
    const filePath = path.join(rootDir, file)

    if (fs.existsSync(filePath)) {
        console.log(`⏭️  ${pkgFolder}/${file} already exists, skipping`)
        continue
    }

    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8')
    console.log(`✅ Created ${pkgFolder}/${file}`)
}

console.log('🎉 TypeScript package scaffold complete')
