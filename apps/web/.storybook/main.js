import { dirname, join } from 'path'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')))
}

/** @type { import('@storybook/nextjs').StorybookConfig } */
const config = {
  stories: ['../**/*.stories.@(js|jsx|mjs|ts|tsx)', '../../../packages/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-docs')
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {}
  },
  docs: {
    autodocs: true
  },
  // 4/25/24 - disabling this for now because it's throwing errors and I don't have time to debug it.
  // One of the libraries that's newly included as I write the `AttachmentThumbnailList` story is crashing the TS parser.
  // We still get basic docs for our own props, but without this Storybook won't pick up prop types from imported libraries.
  // typescript: {
  //   reactDocgen: 'react-docgen-typescript',
  //   reactDocgenTypescriptOptions: {
  //     // include props from imported libraries
  //     propFilter: () => true
  //   }
  // },
  staticDirs: ['../public']
}
export default config
