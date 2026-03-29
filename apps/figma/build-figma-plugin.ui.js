const { readFile, stat, writeFile } = require('fs/promises')
const path = require('path')

/**
 * @param {import('esbuild').BuildOptions} buildOptions
 * @returns  {import('esbuild').BuildOptions}
 */
module.exports = function ({ jsxFactory, jsxFragment, ...buildOptions }) {
  const isProd = buildOptions.minify
  const appUrl =
    process.env.NEXT_PUBLIC_WEB_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
    'https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app'
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || ''
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'eu'

  // Define environment variables for the UI build
  const env = {
    APP_URL: appUrl,
    AUTH_URL: appUrl,
    API_URL: appUrl,
    PUSHER_KEY: pusherKey,
    PUSHER_APP_CLUSTER: pusherCluster,
    SLACKBOT_CLIENT_ID: isProd ? '3424176891222.3424180786422' : '3424176891222.4588976536711'
  }

  const define = Object.entries(env).reduce((acc, [key, value]) => {
    acc[`window.${key}`] = JSON.stringify(value)
    return acc
  }, {})

  // Wildcard all `process.env` usage coming from `@campsite/ui` to undefined
  define['process.env'] = '{}'

  return {
    ...buildOptions,
    jsx: 'automatic',
    plugins: [
      {
        name: 'css',
        setup(build) {
          build.onResolve({ filter: /\.css$/ }, async function (args) {
            let cssPath = args.path

            if (args.path.startsWith('!')) {
              cssPath = args.path.slice(1)
            }
            const cssFilePath = path.resolve(args.resolveDir, cssPath)
            const css = await readFile(cssFilePath, 'utf8')

            const elementId = (await stat(cssFilePath)).mtimeMs

            const js = `
              if (document.getElementById('${elementId}') === null) {
                const element = document.createElement("style");
                element.id = '${elementId}';
                element.innerHTML = \`${css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\\2c /g, ',')}\`;
                document.head.append(element);
              }
              export default {}
            `

            const jsPath = path.resolve(__dirname, 'build/global.js')

            await writeFile(jsPath, js, { encoding: 'utf8' })

            return {
              path: jsPath
            }
          })
        }
      },
      {
        name: 'next-compat',
        setup(build) {
          build.onResolve({ filter: /^next/ }, (args) => {
            return { path: path.resolve(__dirname, `src/compat/${args.path}/index.ts`) }
          })
          build.onResolve({ filter: /^@sentry\/nextjs/ }, (args) => {
            return { path: path.resolve(__dirname, `src/compat/${args.path}/index.ts`) }
          })
        }
      }
    ],
    define
  }
}
