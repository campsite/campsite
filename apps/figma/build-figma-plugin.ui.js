const { readFile, stat, writeFile } = require('fs/promises')
const path = require('path')

/**
 * @param {import('esbuild').BuildOptions} buildOptions
 * @returns  {import('esbuild').BuildOptions}
 */
module.exports = function ({ jsxFactory, jsxFragment, ...buildOptions }) {
  const isProd = buildOptions.minify

  // Define environment variables for the UI build
  const env = {
    APP_URL: isProd ? `https://app.campsite.com` : `https://app-dev.campsite.com`,
    AUTH_URL: isProd ? `https://auth.campsite.com` : `https://api-dev.campsite.com`,
    API_URL: isProd ? `https://api.campsite.com` : `https://api-dev.campsite.com`,
    PUSHER_KEY: isProd ? '1301e1180de87095b1c0' : '874a1de2f18896929939',
    PUSHER_APP_CLUSTER: 'us3',
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
