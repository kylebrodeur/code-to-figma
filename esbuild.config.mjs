import * as esbuild from 'esbuild'

const isWatch = process.argv.includes('--watch')

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'code.js',
  target: ['es2017'],
  logLevel: 'info',
}

if (isWatch) {
  const ctx = await esbuild.context(buildOptions)
  await ctx.watch()
  console.log('Watching for changes...')
} else {
  await esbuild.build(buildOptions)
}
